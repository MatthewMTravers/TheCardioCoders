from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from chatBot import graph
import time

app = Flask(__name__)
CORS(app)

# Streaming response for asynchronous delivery
@app.route('/chat/stream', methods=['GET'])
def stream():
    user_question = request.args.get("message", "")

    def generate_response():
        try:
            # Invoke stategraph (assuming it returns an iterable response)
            response_stream = graph.invoke({"question": user_question})

            # Check if response_stream['answer'] is an iterable or streamable object
            if hasattr(response_stream["answer"], '__iter__'):
                for chunk in response_stream["answer"]:
                    words = chunk.split()  # Split the chunk into words
                    for word in words:
                        print(f"{word}", end=" ")  # Print each word followed by a space
                        yield f"data: {word}\n\n"
            else:
                print(f"Streaming final answer: {response_stream['answer']}")  # Print the final answer if not chunked
        except Exception as e:
            print(f"Error in stream: {e}")

    return Response(generate_response(), content_type="text/event-stream")

# Non-streaming response dump
@app.route('/chat', methods=['POST'])
def handle_message():
    # Get question from the user to be processed by the bot
    data = request.json
    user_question = data.get("message", "")

    # Invoke state graph created in 'chatBot.py'
    response = graph.invoke({"question": user_question})
    
    return jsonify({"answer": response["answer"]})

if __name__ == '__main__':
    app.run(debug=True, threaded=True)