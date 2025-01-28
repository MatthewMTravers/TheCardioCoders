from langchain_ollama.llms import OllamaLLM
from langchain_ollama import OllamaEmbeddings

ollama = OllamaLLM(base_url = 'http://localhost:11434', model = 'llama3.2')

call = ollama.invoke('why is the sky blue?')

print(call)