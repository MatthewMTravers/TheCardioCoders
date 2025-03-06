import faiss
import numpy as np

try:
    index = faiss.read_index('data/faiss_index.index')
    embeddings_matrix = np.load('data/embeddings.npy')

    print(f"Loaded FAISS index with {index.ntotal} vectors")
    print(f"Embeddings shape: {embeddings_matrix.shape}")

except Exception as e:
    print(f"FAISS Loading Error: {str(e)}")
