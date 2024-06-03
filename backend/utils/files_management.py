import datetime
import json
import os
import random
import tempfile

from openai import AzureOpenAI
import pypdf
from utils.loaders import DocxLoader
from langchain_community.vectorstores import AzureSearch
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from flask import jsonify
from langchain_openai import AzureOpenAIEmbeddings
from langchain.document_loaders import CSVLoader, TextLoader, PyPDFLoader, Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

load_dotenv()

ALLOWED_EXTENSIONS = {'pdf', 'txt', 'csv', 'docx', 'doc'}
model: str = "text-embedding-ada-002"
index_name = os.getenv('SEARCH_INDEX_NAME')
embeddings = AzureOpenAIEmbeddings(deployment=model, chunk_size=1)

search_client = SearchClient(endpoint=os.getenv('AZURE_SEARCH_ENDPOINT'), index_name=os.getenv('SEARCH_INDEX_NAME'),
                             credential=AzureKeyCredential(os.getenv('AZURE_SEARCH_KEY')))

vector_store: AzureSearch = AzureSearch(
    azure_search_endpoint=os.getenv('AZURE_SEARCH_ENDPOINT'),
    azure_search_key=os.getenv('AZURE_SEARCH_KEY'),
    index_name=index_name,
    embedding_function=embeddings.embed_query,
)

current_datetime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def generate_embeddings(text):
    client = AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version="2024-02-15-preview",
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
    )
    model: str = "text-embedding-ada-002"
    return client.embeddings.create(input=[text], model=model).data[0].embedding


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def queryByID(documentId):
    try:
        doc = search_client.get_document(key=documentId)
        return True
    except Exception as e:
        return False


def store_to_index(docs):
    if not docs:
        return None
    search_client.upload_documents(docs)


def process_files(files, allmetadata):
    try:
        file_extension = files.filename.rsplit('.', 1)[1].lower()
        file_content = files.read()

        # Use a dictionary to map file extensions to their corresponding Loader classes
        extension_to_loader = {
            'pdf': PyPDFLoader,
            'txt': TextLoader,
            'csv': CSVLoader,
            'docx': DocxLoader
        }

        # Get the appropriate Loader based on the file extension
        Loader = extension_to_loader.get(file_extension)
        if not Loader:
            return jsonify({'error': 'Invalid file type'})

        # Convert bytes to text for 'txt' and 'csv' files
        if file_extension in ['txt', 'csv']:
            file_content = file_content.decode('utf-8')

        # Create a temporary file to store the uploaded content
        with tempfile.NamedTemporaryFile(delete=False, mode='wb' if file_extension in ['pdf', 'docx'] else 'w', encoding=None if file_extension in ['pdf', 'docx'] else 'utf-8') as temp_file:
            temp_file.write(file_content)
            temp_file.flush()
            temp_file_path = temp_file.name

        try:
            # Load the documents using the specified Loader
            loader = Loader(temp_file_path)
            documents = loader.load()

            # Split documents into chunks
            splitter = RecursiveCharacterTextSplitter(chunk_size=4000, chunk_overlap=500)
            docs = splitter.split_documents(documents)

            count = 0
            processed_docs = []
            orgunits = []
            documentID = ""

            for doc in docs:
                doc_data = {}
                for metadata in allmetadata:
                    key = metadata.get('key')
                    value = metadata.get('value')
                    if key == 'orgunits':
                        orgunits = value.split(',')
                    elif key == 'documentId':
                        documentID = value
                        doc_data['id'] = documentID if count == 0 else f"{documentID}-{count}"
                doc_data['content'] = doc.page_content
                doc_data['last_modified_date'] = current_datetime
                doc_data["orgunits"] = orgunits
                doc_data['content_vector'] = generate_embeddings(doc.page_content)
                count += 1
                processed_docs.append(doc_data)
                # Store processed documents in an index
                store_to_index(processed_docs)
            return jsonify({'status': 'success'})

        finally:
            os.remove(temp_file_path)

    except FileNotFoundError as e:
        return jsonify({'error': f'File not found: {e}'})
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'})


def modify_metadata(documentId, metadatas):
    count = 0
    while queryByID(f"{documentId}-{count}") is True or (queryByID(documentId) is True and count == 0):
        parameters = []
        doc = {
            "@search.action": "merge",
            "last_modified_date": current_datetime,
        }
        if count == 0:
            doc['id'] = documentId
        else:
            doc['id'] = f"{documentId}-{count}"
        for metadata in metadatas:
            key = metadata.get('key')
            value = metadata.get('value')
            if key == 'documentId':
                continue
            elif key == 'orgunits':
                orgunits = value.split(',')
                doc['orgunits'] = orgunits
            else:
                doc[key] = value

        parameters.append(doc)
        search_client.merge_documents(parameters)
        count += 1


def delete_documents(documentID):
    count = 1
    if queryByID(documentID):
        search_client.delete_documents({"id": documentID})
        while queryByID(f"{documentID}-{count}") is True:
            search_client.delete_documents([{"id": f"{documentID}-{count}"}])
            count += 1

