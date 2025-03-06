from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from chatBot import graph
import logging

app = Flask(__name__)
CORS(app)

with open("prompt.txt", "r", encoding="utf-8") as f:
    example_workout_plan = f.read()

# Processes the users question from the frontend and returns Bot's response
@app.route('/chat', methods=['POST'])
def handle_message():
    # Get question from the user to be processed by the bot
    data = request.json
    user_question = data.get("message", "")

    # Invoke state graph created in 'chatBot.py'
    #response = graph.invoke({"question": user_question})
    
    #return jsonify({"answer": response["answer"]})
    return jsonify({"answer": example_workout_plan})
if __name__ == '__main__':
    app.run(debug=True)