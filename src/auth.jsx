import { useState, useEffect } from 'react'

import { supabase } from './supabaseClient'


function Auth({ onLoginSuccess }) {
    const [loading, setLoading]=useState(false)
    const [email, setEmail]=useState('')
    const [claims,setClaims]=useState(null)

    const params = new URLSearchParams(window.location.search)
    const hasTokenHash = params.get('token_hash')

    const [verifying, setVerifying] = useState(!!hasTokenHash)
    const [authError,setAuthError] = useState(null)
    const [authSuccess,setAuthSucess] = useState(false)

    useEffect(()=>{
        const params = new URLSearchParams(window.location.search)
        const token_hash = params.get('token_hash')
        const type = params.get('type')

        if (token_hash) {
            supabase.auth
            .verifyOtp({
                token_hash,
                type: type || 'email',})
                .then(({error})=>{
                    if (error) {
                    setAuthError(error.message)
                    }
                    else {
                        setAuthSucess(true)
                        window.history.replaceState({}, document.title,'/')
                        onLoginSuccess?.()
                    }
                    setVerifying(false)
                })
        }
        supabase.auth.getClaims().then(({data,error}) => { setClaims(data?.claims ?? null) })
        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange(()=> {
            supabase.auth.getClaims().then(({data,error})=> { setClaims(data?.claims ?? null)})
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

    if (verifying) {
        return (
            <div>
                <h1>auth</h1>
                <p>confirming...</p>
                <p>cheese..</p>
            </div>
        )
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

    if (authSuccess && !claims) {
        return (
            <div>
                <h1>auth</h1>
                <p>auth successful :D</p>
                <p>loading...</p>
            </div>
        )
    }

    if (claims) {
        return (
            <div>
                <h1>hi :D</h1>
                <p> you are logged in as {claims.email}</p>
                <button onClick={handleLogout}>Sign out</button>
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