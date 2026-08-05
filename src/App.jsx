import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import Calendar from './calendar'
import Todo from './todo'
import Auth from './auth'


function App() {
  const [page, setPage] = useState('landing')
  const [loading,setLoading] = useState(false)
  const [claims,setClaims] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  

  useEffect(()=> {
    const loadClaims= async() => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const { data, error } = await supabase.auth.getClaims()

      setClaims(session ? data?.claims ?? null : null)
      setCheckingSession(false)
    }
    loadClaims()
    
const { data: { subscription } } = supabase.auth.onAuthStateChange((event,session) => {
      supabase.auth.getClaims().then(({ data }) => {
        const newClaims = data?.claims ?? null
        setClaims(newClaims)
        if (newClaims && (page !== 'landing' || event === 'SIGNED_IN')) setPage('calendar')
      })
    })

    return () => subscription.unsubscribe() 
  }, [])

  if (page === 'landing'){
        return (<>
          <h1>Ploot</h1>
          <p>a planner that schedules your work so that you don't need to decide</p>
          <br></br>
          <button onClick={() => setPage(claims ? 'calendar' : 'auth')}>get started</button>
          <br></br>
        </>)
    }
  if (page === 'auth' || !claims){
        return <Auth />
  }

  if (checkingSession) {
    return <p>loading...</p>
  }

  if (!claims) {
    return <Auth />
  }

  const handleLogout = async() => {
        await supabase.auth.signOut()
        setClaims(null)
  }

  
  return (
    <>
      
      
      {page === 'calendar' && 
        (<>
          <h1>Ploot</h1>
          <p>when are you able to study?</p>
          <p></p>
          <Calendar />
          <br></br>
          <button onClick={handleLogout} disabled={loading}>{loading ? "logging out..." : "logout"}</button>
          <button onClick={() => setPage('todo')}>next</button>
          <br></br>
        </>)
      }
      {page === 'todo' && 
        (<>
          <h1>Ploot</h1>
          <p>what do you need to do today?</p>
          <Todo />
          <button onClick={handleLogout} disabled={loading}>{loading ? "logging out..." : "logout"}</button>
          <button onClick={() => setPage('calendar')}>back</button>
        </>)
      }

      
    </>
  )
}

export default App
