import time
from flask import Flask, request

app = Flask(__name__)

eventss = [
    {"id":1, "name": "free time", "start": "2026-07-21T19:03:00", "end": "2026-07-21T21:03:00"},
    {"id":2, "name": "study time", "start": "2026-07-23T10:03:00", "end": "2026-07-23T12:03:00"},
]

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