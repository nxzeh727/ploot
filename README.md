# ploot
an AI planner that schedules and prioritizes your work so you don't need to spend time deciding.
<br>
I wanted to create a study planner to help me be able to plan efficiently, so I decided to make this :D
The AI looks at your tasks and available time in your schedule, and allocates study time to them based on urgency and other factors. I want to make it reduce the decision fatigue that people face every day. This will be made using python :)

tech stack:
python backend - flask
react frontend
supabase login structure

how to set up locally:
download the file
create a supabase database
create an openrouter api key
create a .env and put inside app
put this inside:
FLASK_APP=app.py
FLASK_ENV=development
OPEN_ROUTER_API_KEY=[put an openrouter api key]
VITE_SUPABASE_URL=[put your supabase url here]
VITE_SUPABASE_KEY=[put your publishable supabase key here]
DATABASE_URL=[put your supabase url in connect here]
Thanks for reading :D
I hope you like it!
