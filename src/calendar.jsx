import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { sortEventSegs } from '@fullcalendar/core/internal'

function Calendar() {
  const [events, setEvents] = useState([])
  const [loading,setLoading] = useState(false)
  
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/events`)
      .then(res => res.json())
      .then(data => setEvents(data))
  },[])
  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        events={events}
        editable={true}
        selectable={true}
        
        select={(info) => {

            fetch(`${import.meta.env.VITE_API_URL}/events`,{
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                title:"study time",
                start: info.startStr,
                end: info.endStr
              })
            }).then(res => res.json())
            .then(savedEvent => setEvents([...events,savedEvent]))
          }}
        eventDidMount={(info) => {
          info.el.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            fetch(`${import.meta.env.VITE_API_URL}/events/${info.event.id}`,{
              method: 'DELETE',
            })
            .then(() => {

              setEvents(prev => prev.filter(ev => ev.id !== Number(info.event.id)))
            })
          })
        }
      }

      />
      
    </>
  );
}

export default Calendar