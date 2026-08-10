
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import requests
import json
from flask_cors import CORS
import jwt
from jwt import PyJWKClient
from functools import wraps
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Integer, String, ForeignKey
from flask_migrate import Migrate
from sqlalchemy.pool import NullPool

load_dotenv()
app = Flask(__name__)
CORS(app)
db_url = os.environ.get("DATABASE_URL", "sqlite:///project.db")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://","postgresql://",1)
app.config["SQLALCHEMY_DATABASE_URI"] = db_url
db = SQLAlchemy(app, engine_options={"poolclass": NullPool})
migrate = Migrate(app, db)
OPENROUTER_API_KEY = os.getenv('OPEN_ROUTER_API_KEY')
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

jwks_client = PyJWKClient(JWKS_URL)

class Plans(db.Model):

    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.String, nullable=False)
    title = db.Column(db.String, nullable=False)
    start = db.Column(db.String, nullable=False)
    end = db.Column(db.String, nullable=False)

class Notes(db.Model):

    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.String, nullable=False)
    content = db.Column(db.String, nullable=False)
    time_created = db.Column(db.DateTime, nullable=False)
    

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
    userevnts = Plans.query.filter_by(user_id = request.user_id).all()
    return [{'id': e.id, 'title': e.title, 'start': e.start, 'end': e.end} for e in userevnts]

@app.route('/events', methods=['POST'])
@require_auth
def add_event():
    event = request.get_json()
    potato = Plans(user_id =request.user_id,title=event['title'],
                   start=(event['start']), 
                   end = (event['end']) )
    db.session.add(potato)
    db.session.commit()
    return {
    'id': potato.id,
    'title': potato.title,
    'start': potato.start,
    'end': potato.end
}

@app.route('/events/<int:event>', methods=['DELETE'])
@require_auth
def clear_events(event):
    curry = Plans.query.filter_by(id=event, user_id=request.user_id).first()
    if not curry:
        return jsonify({'error':'not found'},404)
    db.session.delete(curry)
    db.session.commit()
    return {'status':'deleted'}

@app.route('/todo', methods=['POST'])
@require_auth
def add_notes():
    note = request.get_json()
    tasks = note.get('notes')
    cheese = Notes(user_id=request.user_id, content=tasks, time_created = datetime.now())
    db.session.add(cheese)
    db.session.commit()
    userevnts = Plans.query.filter_by(user_id = request.user_id).all()
    potat =  [{'id': e.id, 'title': e.title, 'start': e.start, 'end': e.end} for e in userevnts]
    prompt = f"""todays date is {datetime.now()}
                this is what i am supposed to do today: {tasks}
                 please create a detailed schedule for today(today and today ONLY) with exact start
                 and end 
                 times strictly within these time periods: {potat}
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
    if 'choices' not in response.json():
        return {'error':'sorry the ai is being kinda scammy today :('}, 502
    
    return {'schedule': response.json()['choices'][0]['message']['content']}


if __name__ == '__main__':
    app.run(debug=False)