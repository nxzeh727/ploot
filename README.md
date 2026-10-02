# ploot
an AI-powered planner that schedules and prioritizes your work so you don't need to spend time deciding.

<img width="1446" height="389" alt="Screenshot 2026-09-26 at 21 25 25" src="https://github.com/user-attachments/assets/7485afc6-caeb-4fdd-a37b-8e20217a7a90" />

<br>
I wanted to create a study planner to help me be able to plan efficiently, so I decided to make this :D
The AI looks at your tasks and available time in your schedule, and allocates study time to them based on urgency and other factors. 
Its editable(manual), modifiable(using ai), and can be exported to your calendar(very practical!). I want to make it reduce the decision fatigue that people face every day, as people spend a lot of time planning and not a lot of time doing.

<br> 

## how to use?
very easy! just open [https://ploot-1.onrender.com](https://ploot-1.onrender.com) :)

<br> 

## how does it work?
ploot is intended to help you figure out where to fit everything in and save time.
1. mark your study times/availability
2. write your todolist
3. the ai generates your schedule!
4. modify with ai(or manually) if you don't like it
5. export as an .ics file so you can import it into your other calendars

the dashboard shows how many study blocks you have and the date, so you can start planning right away :)

<br>

## tech stack
frontend:
 - react and vite as base
 - fullcalendar used for calendar
 - tiptap used for rich text editor that acts as todolist
 - tailwind css and daisyui for ui stuff
 - supabase js client for login auth and session stuff

backend:
 - flask
 - supabase for storing user, task, and availability info
 - pyjwt helps verify server-side stuff
 - openrouter ai for the ai-powered part of the app

deployed via render, but two seperate services for frontend and backend
used a little bit of ai in debugging because its my first time using supabase jwt and things like that 

<br> 

## known limitations

- no recurring stuff yet, and only scheuldes for one day
- rate-limiting if used too much :(
- the schedules generated only persist in the page they are created, if you don't download it its gone

<br>

## future ideas

 - save schedules to your account!
 - maybe a more concrete todolist?
 - recurring templates
 - learning from modification feedback

<br>

im very happy with what i created because its my first time doing something like this! i hope you like it :)



