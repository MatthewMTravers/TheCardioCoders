from langchain_ollama.llms import OllamaLLM
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import JSONLoader
import json
from langchain.schema import Document
from uuid import uuid4
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain import hub
from typing_extensions import List, TypedDict
from langchain_core.documents import Document
from langgraph.graph import START, StateGraph
import logging


# Initialize the LLM and Embedding Model (same as used in jupyter notebook)
ollama = OllamaLLM(model='llama3.2')
embedding_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Load the FAISS index and document embeddings
index = faiss.read_index('data/faiss_index.index')
embeddings_matrix = np.load('data/embeddings.npy')

# Current hardcoded JSON response
raw_json_docs = [
    "data/exercises/exercises1.json", 
    "data/exercises/exercises2.json", 
    "data/exercises/exercises3.json"
    ]

documents = []
num = 0

# Process JSON files
for file in raw_json_docs:
    json_loader = JSONLoader(file, jq_schema=".", text_content=False)
    doc = json_loader.load()

    # Splitting the document
    for exercise in doc:
        exercise_content = exercise.page_content
        exercise_dict = json.loads(exercise_content)

        # Check if the exercise_dict is a dictionary and contains 'exercises' key
        if isinstance(exercise_dict, dict):
            exercise_list = exercise_dict.get("exercises", [])
        elif isinstance(exercise_dict, list):
            # If exercise_dict is a list, you can directly assign it
            exercise_list = exercise_dict
        else:
            continue

        # Add each exercise as an individual document
        for exercise_item in exercise_list:
            document = Document(page_content=str(exercise_item), metadata={"source": file, "seq_num": num + 1})
            num += 1
            documents.append(document)

# Function to query the FAISS vector store and get relevant documents
def query_vector_store(query, k=5):
    # Convert the query into an embedding
    query_embedding = embedding_model.encode([query])[0]
    
    # Perform a similarity search on the FAISS index
    query_embedding = np.array([query_embedding]).astype(np.float32)
    D, I = index.search(query_embedding, k)  # Retrieve the top k most similar documents
    
    # Fetch the corresponding documents based on the indices returned by FAISS
    relevant_docs = [documents[i] for i in I[0]]
    
    return relevant_docs

################################################################################

# TODO: look into using different prompt, as mentioned in the lecture recording
with open("prompts/workoutPlanPrompt", "r") as file:
    workoutPlanPrompt = file.read()

with open("prompts/conciseAnswerPrompt", "r") as file:
    conciseAnswerPrompt = file.read()


# Defines the object with properties required for queries 
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

# Retrieves relevant documents based on the user's question  
def retrieve(state:State):
    retrieved_docs = query_vector_store(state["question"])
    return {"context": retrieved_docs}

# Generates an answer using the retrieved documents and streams output
def generate(state: State):
    docs_content = "\n\n".join([doc.page_content for doc in state["context"]])

    # Choose the appropriate prompt template
    if "workout plan" in state["question"].lower() or "exercise routine" in state["question"].lower():
        prompt_text = workoutPlanPrompt.format(context=docs_content, question=state["question"])
    else:
        prompt_text = conciseAnswerPrompt.format(context=docs_content, question=state["question"])

    # Stream response from Ollama using the chosen prompt
    response_stream = ollama.stream(prompt_text)

    def stream_generator():
        # print("Streaming response:")
        buffer = ""

        for chunk in response_stream:
            buffer += chunk

            # Split by newline to preserve structured formatting
            while '\n' in buffer:
                line, buffer = buffer.split('\n', 1)
                # print(line)
                yield line + '\n'

        # Yield any remaining text
        if buffer:
            # print(buffer)
            yield buffer

    return {"answer": stream_generator()}


# Compile application and make state graph
graph_builder = StateGraph(State).add_sequence([retrieve, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()