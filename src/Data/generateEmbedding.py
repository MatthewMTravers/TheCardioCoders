import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain.schema import Document
from langchain_community.document_loaders import JSONLoader

# Load JSON data - can be changed as needed
raw_json_docs = ["src/data/exercises/exercises1.json",  "src/data/exercises/exercises2.json",  "src/data/exercises/exercises3.json",  "src/data/exercises/exercises4.json",  "src/data/exercises/exercises5.json"]

documents = []
num = 0
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

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

# Create embeddings for the documents
document_texts = [doc.page_content for doc in documents]
embeddings_vectors = model.encode(document_texts)

# Prepare FAISS index
dimension = len(embeddings_vectors[0])  # Get the embedding dimension
index = faiss.IndexFlatL2(dimension)  # L2 distance index for FAISS

# Convert embeddings to numpy array and add to the FAISS index
embeddings_matrix = np.array(embeddings_vectors).astype(np.float32)
index.add(embeddings_matrix)

# Save files for use by chatbot
faiss.write_index(index, 'faiss_index.index')
np.save('embeddings.npy', embeddings_matrix)
