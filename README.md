## Project Set Up:

1. Install Ollama
2. Make sure Ollama is running before running chatbot
3. Might need to do pip install bs4
4. Install Docker Desktop
5. run the cmd
   curl -sfL https://raw.githubusercontent.com/milvus-io/milvus/master/scripts/standalone_embed.sh -o standalone_embed.sh
6. start Milvus with cmd (only need to do this once. then you can start milvus in docker desktop. everytime you start it, youll get a bunch of new log files)
   bash standalone_embed.sh start

## Current Project Description:

This application is a **Retrieval-Augmented Generation (RAG) system** that helps users find **relevant exercises** from a dataset and generate responses using an AI model. It combines **vector search (FAISS)** with a **large language model (LLM)** to provide **context-aware answers** to fitness-related questions.

1. Documents are loaded in using JSON responses from various APIs (currently hardcoded, future implementation will query them as needed or create a store for them for persistent use).
2. Using `SentenceTransformer`, these documents are converted into vector embeddings (numerical representations of the text) which are stored in a `FAISS` vector store. This vector store allows you to query the most relevant results based on the embeddings.
3. Based on the "K" best documents selected (smaller values are better for more precise results and faster query times but larger values give more context), the LLM generates a detailed answer and adds it to the  `StateGraph` which manages the flow between steps (retrieving documents → generating an answer), providing a structured and modular way to handle the process.
4. Finally, the response is printed to the user with a relevant answer relating to their initial question.
