# **Cardio Coders: Retrieval-Augmented Generation (RAG) Project**

## Project Overview

Cardio coders is a smart fitness assistant that uses advanced AI technology to proivde context-aware excercise and fitness recommendations. By combining large language models and vector search, the application can understand and respond to fitness-related queries with precision.

## Prerequisites:

Ensure you have the following installed before you begin:
- Python 3.x
- Node.js and npm
- Docker Desktop
- pip (python package manger)

# Project Set Up:

## Install Dependencies:

1. Install Ollama for AI model support
2. Install required Python packages:
  pip install bs4 

## Set Up Milvus (Vector Database):

1. Download the Milvus standalone script:
  curl -sfL https://raw.githubusercontent.com/milvus-io/milvus/master/scripts/standalone_embed.sh -o standalone_embed.sh
2. Start Milvus:
  bash standalone_embed.sh start

## Start the Backend Server

1. In a new terminal window, navigate to the project directory
2. Run the Flask backend:
  python3 server.py

## Launch the Frontend

1. In a new terminal window, navigate to the project directory
2. Install React dependencies:
  npm install
3. Start the React development server:
  npm start
4. Open your browser and go to http://localhost:3000

## How It Works:

The application uses a sophisticated Retrieval-Augmented Generation (RAG) approach:
- Loads Exercise documents from APIs
- Converts documents to vector embeddings
- Uses vector search to find the most relevant information
- Generates context-aware responses using a large language model

## Troubleshooting:

- Ensure all services(Backend, Ollama, Milvus) are running before starting the frontend
- Check console for any error messages
- Verify all dependencies are correctly installed

# Development Resources
- [Create React App Documentation](https://create-react-app.dev/docs/getting-started/)
- [React Documentation](https://react.dev/)

#Contributing

Contributions are welcome! Please feel free to submit a pull request.

