import time
from flask import Flask, request
import os
from dotenv import load_dotenv
import requests
import json
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app)
OPENROUTER_API_KEY = os.getenv('OPEN_ROUTER_API_KEY')

eventss = [
]
notes = []

@app.route('/time')
def index():
    return {'time': time.time()}

@app.route('/events',methods=['GET'])
def get_events():
    return eventss

@app.route('/events', methods=['POST'])
def add_event():
    event = request.get_json()
    event['id'] = len(eventss) + 1
    eventss.append(event)
    return event

@app.route('/todo', methods=['POST'])
def add_notes():
    note = request.get_json()
    notes.append(note)
    tasks = note.get('notes')
    prompt = f"""this is what i am supposed to do today: {tasks}
                 please create a detailed schedule for today with exact start
                 and end times strictly within these time periods: {eventss}
                 please dont schedule anything outside of those time periods: no breaks, no rest, nothing.
                please also keep in mind: 
                 - realistic time estimatses for tasks
                 - pomodoro style work schedule, with longer breaks after 2-3 hrs of work
                 - harder tasks when most focused
                please return a json style output, with titles, descriptions, start times, and end times
                Return ONLY a JSON array (no markdown, no explanation) where each object has EXACTLY these fields: "title" (string), "description" (string), "start" (ISO 8601 datetime string), "end" (ISO 8601 datetime string). Do not use any other field names.
                thanks :)
                """

    response = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",

    },
    data=json.dumps({
        "model": "google/gemma-4-26b-a4b-it:free",
        "messages": [
        {
            "role": "user",
            "content": prompt
        }
        ]
    })
    )
    
    return {'schedule': response.json()['choices'][0]['message']['content']}

if __name__ == '__main__':
    app.run(debug=False)