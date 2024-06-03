import json
import os

from flask_cors import CORS
from langchain.agents.agent_toolkits import create_conversational_retrieval_agent
from langchain_core.messages import SystemMessage
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from tools.tools import get_basical_tool, get_other_tools
from flask import Flask, render_template, jsonify, request

from utils.files_management import queryByID, process_files, allowed_file, delete_documents, modify_metadata

app = Flask(__name__)
CORS(app)
load_dotenv('.env')


@app.route('/')
def home():
    return render_template('index.html')


# Handle Answer
@app.post('/answer')
def handle_answer():
    try:

        user_input = request.form.get('user_message')
        orgunit = request.form.get('orgunit')
        filter_ = f"orgunits/any(t: t eq '{orgunit}')"

        basic_tool = get_basical_tool(query=user_input, filter_=filter_)

        tools = []
        retrieved_tools = get_other_tools(['Calculator', 'Leave_Days_Tool'])
        for retrieved_tool in retrieved_tools:
            tools.append(retrieved_tool)
        tools.append(basic_tool)

        prompt = "Your responses should be restricted to information within the document I shared. If the question is unrelated, respond with 'I'm sorry, I am not equipped to answer that question.can you ask something else?'"
        llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3)
        system_msg = SystemMessage(type='system', content=prompt)

        agent = create_conversational_retrieval_agent(llm, tools, verbose=True, system_message=system_msg,
                                                      remember_intermediate_steps=False)

        response = agent.invoke(
            {
                "input": user_input,
            },
        )
        answer = response['output']
        return jsonify({'success': answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Handle Upload
@app.post('/upload')
def upload_file():
    try:
        if check_authorization(request):
            pass
        else:
            return jsonify({"error": "Unauthorized source"}), 403
        file = request.files['file']
        filename = file.filename

        if filename == '':
            return jsonify({'error': 'No selected file'})
        if not allowed_file(filename):
            return jsonify({'error': 'Invalid file type'})

        metadata_str = request.form.get('allMetadata')
        metadata_ = json.loads(metadata_str)
        metadata = json.loads(metadata_)

        documentId = next((item['value'] for item in metadata if item['key'] == 'documentId'), None)

        if queryByID(documentId):
            return jsonify({"error": "document id already exists!"})
        else:
            try:
                process_files(file, metadata)
            except Exception as e:
                return jsonify({"error": res_json["error"]})
        return jsonify({'success': f'The file {filename} has been successfully stored!'})
    except Exception as e:
        return jsonify({'error': str(e)})


# Handle overwrite
@app.post('/overwrite')
def delete_doc():
    try:
        if check_authorization(request):
            pass
        else:
            return jsonify({"error": "Unauthorized source"}), 403

        metadata_str = request.form.get('allMetadata')
        metadata_ = json.loads(metadata_str)
        metadata = json.loads(metadata_)

        documentId = next((item['value'] for item in metadata if item['key'] == 'documentId'), None)
        if queryByID(documentId):
            delete_documents(documentId)
            file = request.files['file']
            process_files(file, metadata)
            return jsonify({'success': f'The document {documentId} has been successfully overwritten!'})
        else:
            return jsonify({'error': f' No file found with the corresponded unique Id !'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.post('/update_metadata')
def update_metadata():
    try:
        if check_authorization(request):
            pass
        else:
            return jsonify({"error": "Unauthorized source"}), 403

        metadata_str = request.form.get('allMetadata')
        metadata_ = json.loads(metadata_str)
        metadata = json.loads(metadata_)
        documentId = next((item['value'] for item in metadata if item['key'] == 'documentId'), None)

        if queryByID(documentId):
            try:
                modify_metadata(documentId, metadata)
                return jsonify({"success": "The file has been succesfully updated"})
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        else:
            return jsonify({"error": "A document with this unique ID has not been found"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Handle deleting
@app.post('/delete_documents')
def delete_docs():
    try:
        if check_authorization(request):
            pass
        else:
            return jsonify({"error": "Unauthorized source"}), 403

        metadata_str = request.form.get('allMetadata')
        metadata_ = json.loads(metadata_str)
        metadata = json.loads(metadata_)

        documentId = next((item['value'] for item in metadata if item['key'] == 'documentId'), None)
        if queryByID(documentId):
            delete_documents(documentId)
            return jsonify({'success': f'The document {documentId} has been successfully deleted!'})
        else:
            return jsonify({'error': f' No file found with the corresponded unique Id !'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def check_authorization(request):
    try:
        authorization_header = request.headers.get('Authorization')
        request_body = request
        if authorization_header is None:
            return jsonify({'error': 'Missing Authorization header'}), 401

        parts = authorization_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid Authorization header format'}), 401

        api_key = parts[1]
        if api_key == os.getenv('BACKEND_API_KEY'):
            return True
        else:
            return False
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run()
