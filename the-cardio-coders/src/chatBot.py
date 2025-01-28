from langchain_ollama.llms import OllamaLLM
from langchain_ollama import OllamaEmbeddings
from langchain_milvus import Milvus
from langchain_community.document_loaders import JSONLoader
from langchain_text_splitters import CharacterTextSplitter
from pymilvus import Collection, connections
from uuid import uuid4


ollama = OllamaLLM(model = 'llama3.2')
embeddings = OllamaEmbeddings(model = "llama3.2")

#connect to milvus
vector_store = Milvus(embedding_function=embeddings)

#json files containing data
raw_json_docs = ["exercises1.json", "exercises2.json", "stretches.json"]

documents = []

#split all the files
for file in raw_json_docs:
    #loading the document
    json_loader = JSONLoader(file, jq_schema=".", text_content=False)
    doc = json_loader.load()

    #splitting the document
    text_splitter = CharacterTextSplitter(chunk_size = 1000, chunk_overlap=0)
    split_doc = text_splitter.split_documents(doc)

    #add split document to current list
    documents.extend(split_doc)


#put the documents in the vector store, which acts as the database
uuids = [str(uuid4()) for _ in range(len(documents))]
vector_store.add_documents(documents=documents, ids=uuids)

print("added docs to db")