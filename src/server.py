from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from chatBot import graph
import json

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
            video_links = response_stream.get("formatted_video_links", [])

            # First, send the video links as a special message
            if video_links:
                yield "data: VIDEO_LINKS_START\n\n"
                yield f"data: {json.dumps(video_links)}\n\n"
                yield "data: VIDEO_LINKS_END\n\n"

            # Then send the text response
            if hasattr(generated_response, '__iter__'):
                buffer = ""

                for chunk in generated_response:
                    buffer += chunk

                    while '\n' in buffer:
                        line, buffer = buffer.split('\n', 1)
                        # print(f"[Server Stream] {line}")
                        yield f"data: {line}\n\n"

                # Yield any remaining text after stream ends
                if buffer:
                    # print(f"[Server Stream] {buffer}")
                    yield f"data: {buffer}\n\n"

        except Exception as e:
            print(f"Error in stream: {e}")
            yield "data: Sorry, I encountered an error processing your request.\n\n"

    return Response(generate_response(), content_type="text/event-stream")

# Non-streaming response
@app.route('/chat', methods=['POST'])
def handle_message():
    # Get question from the user to be processed by the bot
    data = request.json
    user_question = data.get("message", "")

    # Invoke state graph created in 'chatBot.py'
    response = graph.invoke({"question": user_question})
    
    # Construct the response with both text and video links
    response_data = {
        "answer": response["answer"],
        "video_links": response.get("formatted_video_links", [])
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True, threaded=True)