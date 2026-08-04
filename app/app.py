import time
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import requests
import json
from flask_cors import CORS
import jwt
from jwt import PyJWKClient
from functools import wraps

load_dotenv()
app = Flask(__name__)
CORS(app)
OPENROUTER_API_KEY = os.getenv('OPEN_ROUTER_API_KEY')
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
print(JWKS_URL)
jwks_client = PyJWKClient(JWKS_URL)

eventss = []
notes = []

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization','')

        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'missing/invalid auth header :('}), 401
        token = auth_header.split(' ')[1]

        try:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=['ES256'],
                audience='authenticated'
            )
        except Exception as e:
            print(e)
            return jsonify({'error': str(e)}),401
        request.user_id = payload['sub']
        request.user_email = payload.get('email')
        return f(*args, **kwargs)
    return decorated

            
@app.route('/events',methods=['GET'])
@require_auth
def get_events():
    userevnts = [e for e in eventss if e.get('user_id') == request.user_id]
    return userevnts

@app.route('/events', methods=['POST'])
@require_auth
def add_event():
    event = request.get_json()
    event['id'] = len(eventss) + 1
    event['user_id'] = request.user_id
    eventss.append(event)
    return event

@app.route('/events/<int:event>', methods=['DELETE'])
@require_auth
def clear_events(event):
    global eventss
    eventss = [e for e in eventss if e['id'] != event]
    return eventss

@app.route('/todo', methods=['POST'])
@require_auth
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