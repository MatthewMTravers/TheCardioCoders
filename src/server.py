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
            response_stream = graph.invoke({"question": user_question})
            generated_response = response_stream["answer"]

            # Ensure the response is iterable
            if hasattr(generated_response, '__iter__'):
                for chunk in generated_response:
                    words = chunk.split()  # Split the chunk into words
                    for word in words:
                        yield f"data: {word}\n\n"
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