import os
from typing import List

import openai
from dotenv import load_dotenv
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever

load_dotenv()
openai.api_type = "openai"
openai.api_key = os.getenv('OPENAI_API_KEY')


class CustomRetriever(BaseRetriever):
    documents: List[Document]
    """List of documents to retrieve from."""
    k: int
    """Number of top results to return"""

    def _get_relevant_documents(
            self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        return self.documents
