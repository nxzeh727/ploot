import { useState, useEffect } from 'react'

import { supabase } from './supabaseClient'


function Auth({ onLoginSuccess }) {
    const [loading, setLoading]=useState(false)
    const [email, setEmail]=useState('')
    const [claims,setClaims]=useState(null)

    const [authError,setAuthError] = useState(null)

    useEffect(()=>{
        supabase.auth.getSession().then(({ data: {session }}) => {
            if (session) {
                onLoginSuccess?.()
            }

        })
        const { data: {subscription}} = supabase.auth.onAuthStateChange((event, session)=> {
            if (event === 'SIGNED_IN' && session) {
                window.history.replaceState({}, document.title,'/')
                onLoginSuccess?.()
            }
            if (event === 'SIGNED_IN' && !session) {
                setAuthError('login failed')
            }
        })

         return () => subscription.unsubscribe()
    
    },[])



    

    const handleLogin = async (event) => {
        event.preventDefault()
        setLoading(true)
        const {error} = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        })
        if (error) {
            alert(error.error_description || error.message)
        } else {
            alert('check ur email for login link :D')
        }
        setLoading(false)
    }
    const handleLogout = async() => {
        await supabase.auth.signOut()
        setClaims(null)
    }



    if (authError) {
        return (
            <div>
                <h1>authentication</h1>
                <p>authentication did not owrk :(</p>
                <p>{authError}</p>
                <button onClick={()=> {
                    setAuthError(null)
                    window.history.replaceState({},document.title,'/')
                }}>Return to login</button>
            </div>
        )
    }




      return (
    <div className='bg-ploot-bg min-h-screen'>
      <div className="navbar shadow-sm">
        <h2 className="text-ploot-text
           text-3xl font-bold
          p-3">Ploot</h2>
        <p className="text-ploot-text text-l p-3">Features</p>
        <p className="text-ploot-text text-l p-3">About</p>
        <p className="text-ploot-text text-l p-3">Contact</p>
      </div>
      <h1 className='text-ploot-text text-4xl p-4 text-center font-bold'>Signup/Login</h1>
      <p className='text-center text-ploot-text'>Sign in via magic link with your email below</p>
      <form onSubmit={handleLogin} className='text-ploot-text mt-2 flex justify-center'>
        <input
            type="email"
            placeholder="Your email"
            value={email}
            required={true}
            onChange={(e) => setEmail(e.target.value)}
            className="input max-w-64 input-sm bg-ploot-bg m-3 items-center text-ploot-text outline-1 outline-ploot-outline"
        />
        <button disabled={loading} className='m-3 text-center btn btn-neutral btn-sm flex flex-col items-centerx'>
            {loading ? <span>Loading</span> : <span>Send magic link</span>}
        </button>
       </form>
      
      
    </div>
  )
}

export default Auth