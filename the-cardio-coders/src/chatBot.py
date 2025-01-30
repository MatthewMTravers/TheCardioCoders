from langchain_ollama.llms import OllamaLLM
from langchain_ollama import OllamaEmbeddings
from langchain_milvus import Milvus
from langchain_community.document_loaders import JSONLoader
from langchain_text_splitters import CharacterTextSplitter
from pymilvus import Collection, connections
from uuid import uuid4
from langchain_text_splitters import RecursiveJsonSplitter
import json
from langchain.schema import Document



ollama = OllamaLLM(model = 'llama3.2')
embeddings = OllamaEmbeddings(model = "llama3.2")

#connect to milvus
vector_store = Milvus(embedding_function=embeddings)

#json files containing data
raw_json_docs = ["stretches.json", "exercises1.json", "exercises2.json"]

documents = []
num = 0

#split all the files
for file in raw_json_docs:
    #loading the document
    json_loader = JSONLoader(file, jq_schema=".", text_content=False)
    doc = json_loader.load()    

    #splitting the document
    for exercise in doc:

        #getting the page content from json, ignoring metadata
        exercise_content = exercise.page_content

        #convert json string to list of dictionaries
        exercise_list = json.loads(exercise_content)

        #add each exercise as an individual document
        for exercise_item in exercise_list:
            document = Document(page_content=str(exercise_item), metadata={"source": file, "seq_num": num+1})
            documents.append(document)


#put the documents in the vector store, which acts as the database
uuids = [str(uuid4()) for _ in range(len(documents))]

vector_store.add_documents(documents=documents, ids=uuids)

print("reached end")

