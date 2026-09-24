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
  const [todayEvents,setTodayEvents] = useState([])
  const [loadingEvents,setLoadingEvents] = useState(true)

  
  const navigateTo = (newPage)  => {
    if (newPage !== 'landing' && newPage !== 'auth'){
      localStorage.setItem('ploot_page',newPage)
    }
    
    setPage(newPage)
  }

  useEffect(() => {
    const loadTodaysEvents = async() => {
      const { data: { session }} = await supabase.auth.getSession()
      console.log(session)
      console.log(session?.access_token)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events`,{
        headers: {
          'Authorization' : `Bearer ${session.access_token}`
        }
      })
      const data = await res.json()
      const today = new Date().toLocaleDateString('en-CA')
      const thingy = data.filter(e=> e.start?.startsWith(today))
      setTodayEvents(thingy)
      setLoadingEvents(false)
    }
    loadTodaysEvents()
  },[])

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
      return (<div className="bg-ploot-bg min-h-screen">
        <div className="navbar shadow-sm">
          <h2 className="text-ploot-text
           text-3xl font-bold
          p-3">Ploot</h2>
        </div>
        <div className="hero">
          <div className='mt-4 p-3'>
            <h1 className="text-ploot-text
            text-4xl font-bold
            p-4 text-center">Time is money.</h1>
            <p className="text-ploot-text
            text-center
            mt-4">a planner that schedules your work so that you don't need to decide
            </p>
          </div>
          
          <div className="flex justify-center mt-4">
            <button className="text-center btn btn-neutral btn-sm flex flex-col items-center btn-center" onClick={() => navigateTo(claims ? 'dashboard' : 'auth')}>get started</button>
          </div>
        </div>
        
        
      </div>)
    }

  if (page === 'auth' || !claims){
        return <Auth onLoginSuccess={() => navigateTo('dashboard')}/>
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
    <div className="bg-ploot-bg min-h-screen" >
      <div className='drawer lg:drawer-open text-ploot-text'>

        <input id="my-drawer-4" type="checkbox" className="drawer-toggle inline" />
          <div className="drawer-content">
            
            <nav className='navbar w-full bg-ploot-bg'>
              <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
                </svg>
              </label>
              <div className="px-4 font-3xl font-bold" onClick={() => navigateTo('landing')}>ploot</div>
            </nav>
            <div className="p-3">
              {page === 'dashboard' && 
                (<>
                  <h2 className="text-ploot-text font-bold">Hi, {claims?.email?.split('@')[0]} :)</h2>
                  <p className="pb-3">Today's date is {new Date().toLocaleString('en-CA',{ weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <hr className="h-px my-2 border-ploot-button-text border-t-2"></hr>
                  <p className="text-ploot-text pt-3 pb-3">you have {todayEvents.length} study block{todayEvents.length !== 1 ? 's': ''} for today</p>
                  <button className='text-ploot-button-text btn btn-neutral mb-2' onClick={() => navigateTo('calendar')}>start scheduling :)</button>
                  <br></br>
                  <button className='text-ploot-button-text btn btn-neutral' onClick={() => navigateTo('todo')}>write down todays tasks :)</button>
                  <br></br>
                </>)
              }
              {page === 'calendar' && (
                <>
                  <div className="cheesee m-3">
                    <p className='text-ploot-text text-3xl m-3 font-bold'>When are you able to study?</p>
                    <button className='m-3 text-ploot-button-text btn btn-neutral' onClick={() => navigateTo('todo')}>next</button>
                  </div>
                  <Calendar key={claims?.sub} />
                  <br></br>
                </>)
              }
              {page === 'todo' && 
                (<>
                  <p className='text-ploot-text text-3xl m-3 font-bold'>what do you need to do today?</p>
                  <Todo key={claims?.sub} savedNotes={savedNotes} onNotesChange={setSavedNotes}/>
                  <button className="btn btn-neutral text-ploot-button-text m-3" onClick={() => navigateTo('calendar')}>back</button>
                </>)
              }
            </div>
          </div>
          <div className="drawer-side is-drawer-close:overflow-visible">
            <label htmlFor="my-drawer-4" aria-label='close sidebar' className="drawer-overlay"></label>
            <div className="flex min-h-full flex-col items-start bg-ploot-sidebar-bg is-drawer-close:w-14 is-drawer-open:w-64">
              <ul className='menu w-full grow'>
                <li>
                  <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="ploot">
                    <span className='is-drawer-close:hidden'>ploot</span>
                  </button>
                </li>
                <li>
                  <button className='text-ploot-text is-drawer-close:tooltip is-drawer-close:tooltip-right is-drawer-close:hidden' data-tip="dashbaord" onClick={() => navigateTo('dashboard')}>dashbaord</button>
                </li>
                <li>
                  <button className='text-ploot-text is-drawer-close:tooltip is-drawer-close:tooltip-right is-drawer-close:hidden' data-tip="logout" onClick={handleLogout} disabled={loading}>{loading ? "logging out..." : "logout"}</button>
                </li>
              </ul>
            </div>
          </div>
          </div>
      </div>
      
      

      

  )
}

export default App
