import json
import os
from typing import Type, Optional, List

import pandas as pd
from dotenv import load_dotenv
from langchain.tools.retriever import create_retriever_tool
from langchain_community.vectorstores import AzureSearch
from langchain_core.callbacks import CallbackManagerForToolRun, AsyncCallbackManagerForToolRun
from langchain_core.tools import BaseTool
from langchain_openai import AzureOpenAIEmbeddings
from pydantic import BaseModel, Field

from utils.retrievers import CustomRetriever

load_dotenv()


# helpful functions :
def get_leave_days_from_local(employee_name):
    # Define filepath
    file_path = './leave_days.csv'
    # Read the file
    df = pd.read_csv(file_path)

    # Check if the 'Leave Days' column exists in the file
    if 'Leave Days' in df.columns:
        # Filter the data for the given employee name
        employee_df = df[df['Employee Name'] == employee_name]

        # Calculate the remaining leave days for the employee
        remaining_leave_days = employee_df['Leave Days'].sum()
    elif 'Remaining Leave Days' in df.columns:
        # Filter the data for the given employee name
        employee_df = df[df['Employee Name'] == employee_name]

        # Calculate the remaining leave days for the employee
        remaining_leave_days = employee_df['Remaining Leave Days'].sum()
    else:
        return None
    # Convert int64 to standard Python int
    remaining_leave_days = int(remaining_leave_days)

    # Create a dictionary to store the result
    result = {
        "Employee Name": employee_name,
        "Remaining Leave Days": remaining_leave_days
    }

    # Convert the dictionary to JSON format
    json_result = json.dumps(result)
    return json_result


# List tools:
class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")


class CustomCalculatorTool(BaseTool):
    name = "Calculator"
    description = "useful for when you need to answer questions about math"
    args_schema: Type[BaseModel] = CalculatorInput
    return_direct: bool = False

    def _run(
            self, a: int, b: int, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool."""
        return a * b

    async def _arun(
            self,
            a: int,
            b: int,
            run_manager: Optional[AsyncCallbackManagerForToolRun] = None,
    ) -> str:
        """Use the tool asynchronously."""
        raise NotImplementedError("Calculator does not support async")


class RetrieveLeaveDays(BaseModel):
    employee_name: str = Field(description="Employee's name")


class LeaveDaysTool(BaseTool):
    name = "Leave_Days_Tool"
    description = "Useful for when asked about remaining leave days"
    args_schema = RetrieveLeaveDays
    return_direct = False

    def _run(self, employee_name: str, run_manager: Optional[CallbackManagerForToolRun] = None) -> int:
        """Use the tool."""
        # Call the function to get the JSON-formatted result
        json_result = get_leave_days_from_local(employee_name)

        # Parse the JSON result
        result_dict = json.loads(json_result)

        # Retrieve the "Remaining Leave Days" value from the dictionary
        remaining_leave_days = result_dict.get("Remaining Leave Days")

        return remaining_leave_days


async def _arun(
        self,
        employee_name: str,
        run_manager: Optional[AsyncCallbackManagerForToolRun] = None,
) -> str:
    """Use the tool asynchronously."""
    raise NotImplementedError("LeaveDaysTool does not support async")


tool2 = CustomCalculatorTool()
tool3 = LeaveDaysTool()
tools = [tool2, tool3]


def get_basical_tool(query: str, filter_: str) -> BaseTool:
    # variables :
    index_name: str = os.getenv('SEARCH_INDEX_NAME')
    model: str = "text-embedding-ada-002"
    embeddings = AzureOpenAIEmbeddings(deployment=model, chunk_size=1)

    vector_store: AzureSearch = AzureSearch(
        azure_search_endpoint=os.getenv('AZURE_SEARCH_ENDPOINT'),
        azure_search_key=os.getenv('AZURE_SEARCH_KEY'),
        index_name=index_name,
        embedding_function=embeddings.embed_query,
    )

    res = vector_store.similarity_search(
        query=query, k=3, filters=filter_
    )
    documents = res
    retriever_ = CustomRetriever(documents=documents, k=3)

    return create_retriever_tool(
        retriever=retriever_,
        name="Document_Retriever",
        description="You are an hepful assistant",

    )


def get_other_tools(tool_names: List[str]):
    retrieved_tools = []

    for tool in tools:
        for tool_name in tool_names:
            if tool.name == tool_name:
                retrieved_tools.append(tool)
    return retrieved_tools
