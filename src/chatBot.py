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
index = faiss.read_index('Data/Exercises/faiss_index.index')
embeddings_matrix = np.load('Data/Exercises/embeddings.npy')

# Current hardcoded JSON response
raw_json_docs = [
    #"data/exercises/exercises1.json", 
    #"data/exercises/exercises2.json", 
   # "data/exercises/exercises3.json",
    "data/exercises/meal1.json"
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
            exercise_list = exercise_dict.get("exercises") or exercise_dict.get("meals") or []
        elif isinstance(exercise_dict, list):
            # If exercise_dict is a list, you can directly assign it
            exercise_list = exercise_dict
        else:
            print(f" Loaded {len(documents)} documents into memory")
            continue

        # Add each exercise as an individual document
        if isinstance(exercise_list, dict):
            for key, item in exercise_list.items():
                document = Document(page_content=str(item), metadata={"source": file, "seq_num": num + 1, "label": key})
                num += 1
                documents.append(document)
        elif isinstance(exercise_list, list):
            for item in exercise_list:
                document = Document(page_content=str(item), metadata={"source": file, "seq_num": num + 1})
                num += 1
                documents.append(document)



def query_vector_store(query, k=5):
    # Convert the query into an embedding
    query_embedding = embedding_model.encode([query])[0]
    
    # Perform a similarity search on the FAISS index
    query_embedding = np.array([query_embedding]).astype(np.float32)
    D, I = index.search(query_embedding, k)  # Retrieve the top k most similar documents
    
    # Fetch the corresponding documents based on the indices returned by FAISS
    relevant_docs = [documents[i] for i in I[0] if i < len(documents)]
    
    return relevant_docs

################################################################################

# TODO: look into using different prompt, as mentioned in the lecture recording
with open("prompts/workoutPlanPrompt", "r") as file:
    workoutPlanPrompt = file.read()

with open("prompts/conciseAnswerPrompt", "r") as file:
    conciseAnswerPrompt = file.read()

with open("prompts/mealPlanPrompt", "r", encoding="utf-8") as file:
    mealPlanPrompt = file.read()

with open("prompts/generalmealplanPrompt", "r", encoding="utf-8") as file:
    generalmealplanPrompt = file.read()




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
    lower_q = state["question"].lower()
    # Choose the appropriate prompt template
    if "general" in lower_q:
        if "workout plan" in lower_q or "exercise routine" in lower_q:
            prompt_text = conciseAnswerPrompt.format(context=docs_content, question=state["question"])
            # Stream response from Ollama using the chosen prompt
            response_stream = ollama.stream(prompt_text)
        elif "meal plan" in lower_q:
            # Use your new meal plan prompt
            prompt_text = generalmealplanPrompt.format(context=docs_content, question=state["question"])
            response_stream = ollama.stream(prompt_text) 
    elif "workout plan" in lower_q or "exercise routine" in lower_q:
    # Use your workout prompt
        prompt_text = workoutPlanPrompt.format(context=docs_content, question=state["question"])
        response_stream = ollama.stream(prompt_text)
    elif "meal plan" in lower_q:
    # Use your new meal plan prompt
        prompt_text = mealPlanPrompt.format(context=docs_content, question=state["question"])
        response_stream = ollama.stream(prompt_text)
    else:
    # Default to your concise prompt
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