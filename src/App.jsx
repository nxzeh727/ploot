import { useState, useEffect,useRef } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import Calendar from './calendar'
import Todo from './todo'
import Auth from './auth'


function App() {
  const [page, setPage] = useState(() => {
    return localStorage.getItem('ploot_page') || 'landing'
  })
  const [loading,setLoading] = useState(false)
  const [claims,setClaims] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [savedNotes,setSavedNotes] = useState('')
  const hasInitialized = useRef(false)

  
  const navigateTo = (newPage)  => {
    localStorage.setItem('ploot_page',newPage)
    setPage(newPage)
  }
  useEffect(()=> {
    const loadClaims= async() => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const { data, error } = await supabase.auth.getClaims()

      setClaims(session ? data?.claims ?? null : null)
      setCheckingSession(false)
      hasInitialized.current=true
    }
    loadClaims()
    
const { data: { subscription } } = supabase.auth.onAuthStateChange((event,session) => {
  console.log('AUTH EVENT FIRED:', event, 'current page:', page)    
  if (event==='TOKEN_REFRESHED') return
      supabase.auth.getClaims().then(({ data }) => {
        const newClaims = data?.claims ?? null
        console.log('newClaims:', newClaims, 'hasInitialized:', hasInitialized.current)
        setClaims(newClaims)
        
      }) 
    
    })

    return () => subscription.unsubscribe() 
  }, [])



  if (checkingSession) {
    return <p>loading...</p>
  }

  if (page === 'landing'){
      return (<>
        <h1>Ploot</h1>
        <p>a planner that schedules your work so that you don't need to decide</p>
        <br></br>
        <button onClick={() => navigateTo(claims ? 'calendar' : 'auth')}>get started</button>
        <br></br>
      </>)
    }

  if (page === 'auth' || !claims){
        return <Auth onLoginSuccess={() => navigateTo('calendar')}/>
  }


  if (!claims) {
    return <Auth />
  }

  const handleLogout = async() => {
        await supabase.auth.signOut()
        localStorage.removeItem('ploot_page')
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
          <button onClick={() => navigateTo('todo')}>next</button>
          <br></br>
        </>)
      }
      {page === 'todo' && 
        (<>
          <h1>Ploot</h1>
          <p>what do you need to do today?</p>
          <Todo savedNotes={savedNotes} onNotesChange={setSavedNotes}/>
          <button onClick={handleLogout} disabled={loading}>{loading ? "logging out..." : "logout"}</button>
          <button onClick={() => navigateTo('calendar')}>back</button>
        </>)
      }

      
    </>
  )
}

export default App
