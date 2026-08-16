import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { sortEventSegs } from '@fullcalendar/core/internal'
import { supabase } from './supabaseClient'


function Calendar() {
  const [events, setEvents] = useState([])
  const [loading,setLoading] = useState(false)
  
  useEffect(() => {
    const loadEvents = async() => {
      const { data: { session }} = await supabase.auth.getSession()
      console.log(session)
      console.log(session?.access_token)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events`,{
        headers: {
          'Authorization' : `Bearer ${session.access_token}`
        }
      })
      const data = await res.json()
      setEvents(data)
    }
    loadEvents()
  },[])

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        events={events}
        editable={true}
        selectable={true}
        eventResizableFromStart={true}
        
        select={ async (info) => {
            const cheese = prompt("give this event a name :)")
            const title = cheese || "study time"
      
            const { data: { session }} = await supabase.auth.getSession()
            const res = await fetch(`${import.meta.env.VITE_API_URL}/events`,{
              method: 'POST',
              headers: {'Content-Type': 'application/json',
                'Authorization':`Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                title:title,
                start: info.startStr,
                end: info.endStr
              })
            })
            const savedEvent = await res.json()
            setEvents([...events,savedEvent])
          }}
         
        eventDrop={ async (info)=>{
          const { data: { session }} = await supabase.auth.getSession()
          const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${info.event.id}`,{
              method: 'PATCH',
              headers: {'Content-Type': 'application/json',
                'Authorization':`Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                start: info.startStr,
                end: info.endStr
              })
            })
          const updated = await res.json()
          setEvents(prev => prev.map(e => 
            e.id === updated.id ? updated : e
            ))
        }}
            
        eventResize={async (info)=>{
          const { data: { session }} = await supabase.auth.getSession()
          const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${info.event.id}`,{
              method: 'PATCH',
              headers: {'Content-Type': 'application/json',
                'Authorization':`Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                start: info.startStr,
                end: info.endStr
              })
            })
          const updated = await res.json()
          setEvents(prev => prev.map(e => 
            e.id === updated.id ? updated : e
            ))
        }}

        eventDidMount={(info) => {
          info.el.addEventListener('contextmenu', async function (e) {
            e.preventDefault();
            const { data: { session }} = await supabase.auth.getSession()
            await fetch(`${import.meta.env.VITE_API_URL}/events/${info.event.id}`,{
              method: 'DELETE',
              headers: {
                'Authorization':`Bearer ${session.access_token}`
              }
            })
            setEvents(prev => prev.filter(ev => ev.id !== Number(info.event.id)))
            })
          }
        }
      

      />
      
      
    </>
  );
}

export default Calendar