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
    <div>
      <h1>login</h1>
      <p>Sign in via magic link with your email below</p>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          required={true}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button disabled={loading}>
          {loading ? <span>Loading</span> : <span>Send magic link</span>}
        </button>
      </form>
    </div>
  )
}

export default Auth