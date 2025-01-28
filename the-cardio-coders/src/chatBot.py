from langchain_ollama.llms import OllamaLLM
from langchain_ollama import OllamaEmbeddings
from langchain_milvus import Milvus
from langchain_community.document_loaders import JSONLoader
from langchain_text_splitters import CharacterTextSplitter
from pymilvus import Collection, connections


ollama = OllamaLLM(model = 'llama3.2')
embeddings = OllamaEmbeddings(model = "llama3.2")

#connect to milvus
vector_store = Milvus(embedding_function=embeddings)

#json files containing data
raw_json_docs = ["exercises1.json", "exercises2.json", "stretches.json"]

split_docs = []

#split all the files
for file in raw_json_docs:
    #loading the document
    json_loader = JSONLoader(file, jq_schema=".", text_content=False)
    doc = json_loader.load()

    #splitting the document
    text_splitter = CharacterTextSplitter(chunk_size = 1000, chunk_overlap=0)
    split_doc = text_splitter.split_documents(doc)

    #add split document to current list
    split_docs.extend(split_doc)

print(split_docs)