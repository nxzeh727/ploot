import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Calendar from './calendar'
import Todo from './todo'
import Auth from './auth'

function App() {
  const [page, setPage] = useState('calendar')
  const [loading,setLoading] = useState(false)

  return (
    <>
      {page === 'start' && 
        (<>
          <h1>Ploot</h1>
          <Auth />
          <button onClick={() => setPage('calendar')}>next :D</button>
        </>)
      }
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
