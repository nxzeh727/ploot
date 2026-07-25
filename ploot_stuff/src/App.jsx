import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Calendar from './calendar'
import Todo from './todo'

function App() {
  const [page, setPage] = useState('calendar')
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/time`).then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, []);

  return (
    <>
      {page === 'calendar' && 
        (<>
          <h1>Ploot</h1>
          <p>when are you able to study?</p>
          <Calendar />
          <br></br>
          <button onClick={() => setPage('todo')}>next</button>
          <br></br>
        </>)
      }
      {page === 'todo' && 
        (<>
          <h1>Ploot</h1>
          <p>what do you need to do today?</p>
          <Todo />
          
          <button onClick={() => setPage('calendar')}>back</button>
        </>)
      }

      
    </>
  )
}

export default App
