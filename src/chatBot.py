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
import os
from exercise_video_utils import get_video_links_for_text

# Initialize the LLM and Embedding Model
ollama = OllamaLLM(model='llama3.2')
embedding_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Load the FAISS index and document embeddings
index = faiss.read_index(os.path.join(script_dir, 'data/faiss_index.index'))
embeddings_matrix = np.load(os.path.join(script_dir, 'data/embeddings.npy'))

# Define paths to JSON files
raw_json_docs = [
    os.path.join(script_dir, 'data/Exercises/exercises1.json'),
    os.path.join(script_dir, 'data/Exercises/exercises2.json'),
    os.path.join(script_dir, 'data/Exercises/exercises3.json'),
    os.path.join(script_dir, 'data/Exercises/exercises4.json'),
    os.path.join(script_dir, 'data/Exercises/exercises5.json'),
    os.path.join(script_dir, 'data/stretches.json'),
    os.path.join(script_dir, 'data/Food/foodfacts1.json'),
    os.path.join(script_dir, 'data/Food/foodfacts2.json'),
    os.path.join(script_dir, 'data/Food/foodfacts3.json'),
    os.path.join(script_dir, 'data/Food/foodfacts4.json'),
    os.path.join(script_dir, 'data/Food/foodfacts5.json'),
    os.path.join(script_dir, 'data/Food/foodfacts6.json'),
    os.path.join(script_dir, 'data/Food/foodfacts7.json'),
    os.path.join(script_dir, 'data/Food/foodfacts8.json'),
    os.path.join(script_dir, 'data/Food/foodfacts9.json'),
    os.path.join(script_dir, 'data/Food/foodfacts10.json'),
]

documents = []
num = 0

# Process JSON files
for file in raw_json_docs:
    try:
        json_loader = JSONLoader(file, jq_schema=".", text_content=False)
        doc = json_loader.load()

        # Splitting the document
        for entry in doc:
            entry_content = entry.page_content
            entry_dict = json.loads(entry_content)

            # Check if the entry_dict is a dictionary and contains 'exercises' or 'foodfacts' key
            if isinstance(entry_dict, dict):
                entry_list = entry_dict.get("exercises", []) or entry_dict.get("foodfacts", [])
            elif isinstance(entry_dict, list):
                # If entry_dict is a list, you can directly assign it
                entry_list = entry_dict
            else:
                continue

            # Add each entry as an individual document
            for entry_item in entry_list:
                document = Document(page_content=str(entry_item), metadata={"source": file, "seq_num": num + 1})
                num += 1
                documents.append(document)
    except Exception as e:
        print(f"Error loading file {file}: {e}")

# Function to query the FAISS vector store and get relevant documents
def query_vector_store(query, k=5):
    try:
        # Convert the query into an embedding
        query_embedding = embedding_model.encode([query])[0]
        
        # Perform a similarity search on the FAISS index
        query_embedding = np.array([query_embedding]).astype(np.float32)
        D, I = index.search(query_embedding, k)  # Retrieve the top k most similar documents
        
        # Fetch the corresponding documents based on the indices returned by FAISS
        relevant_docs = [documents[i] for i in I[0]]
        
        return relevant_docs
    except Exception as e:
        print(f"Error in vector store query: {e}")
        return []

# Custom RAG prompt with video link support
custom_rag_prompt = """
You are Cardio Coders, a helpful fitness assistant that provides exercise and nutrition advice. Use the following context to answer the user's question. If you don't know the answer, say you don't know and suggest related topics the user might be interested in.

When discussing exercises, try to be helpful with form tips and recommendations. Include links to demonstration videos when available.

Context: {context}

Question: {question}

Answer:
"""

# Updated State definition
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str
    video_links: List[dict]
    
# Retrieves relevant documents based on the user's question  
def retrieve(state: State):
    retrieved_docs = query_vector_store(state["question"])
    
    # Extract exercise names and get video links
    video_links = get_video_links_for_text(state["question"])
    
    return {"context": retrieved_docs, "video_links": video_links}

# Generates an answer using the retrieved documents and streams output
def generate(state: State):
    docs_content = "\n\n".join([doc.page_content for doc in state["context"]])
    
    # Add video links information to the context if available
    video_links_info = ""
    if state["video_links"]:
        video_links_info = "\n\nVideo demonstration links for mentioned exercises:\n"
        for exercise in state["video_links"]:
            video_links_info += f"- {exercise['name']}: Regular video: {exercise['video_url']}, Short: {exercise['short_url']}\n"
    
    # Create the prompt with context and video links
    full_context = docs_content + video_links_info
    
    # Create the prompt message
    prompt_message = custom_rag_prompt.format(
        context=full_context,
        question=state["question"]
    )
    
    # Stream response from Ollama instead of returning all at once
    response_stream = ollama.stream(prompt_message)
    
    def stream_generator():
        buffer = ""

        # Iterate over chunks of the response stream
        for chunk in response_stream:
            buffer += chunk
            words = buffer.split()
            
            # Check if the last word is complete
            if not buffer.endswith(" "):
                buffer = words.pop() if words else ""  # Keep the last word in the buffer if it's incomplete
            else:
                buffer = ""

            # Return each word with a space
            for word in words:
                yield word + " "

        # Yield any remaining buffered word
        if buffer:
            yield buffer + " "

    # Return the generator for SSE support
    return {"answer": stream_generator()}

# Add a video link formatter to prepare the front-end display
def format_video_links(state: State):
    # Format video links data for the frontend
    formatted_links = []
    if state["video_links"]:
        for exercise in state["video_links"]:
            formatted_links.append({
                "exercise": exercise["name"],
                "difficulty": exercise["difficulty"],
                "muscle_groups": exercise["muscle_groups"],
                "video_url": exercise["video_url"],
                "short_url": exercise["short_url"]
            })
    
    return {"formatted_video_links": formatted_links}

# Compile application and make state graph
graph_builder = StateGraph(State).add_sequence([retrieve, generate, format_video_links])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()