import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { sortEventSegs } from '@fullcalendar/core/internal'

function Calendar() {
  const [events, setEvents] = useState([])
  
  useEffect(() => {
    fetch('/events')
      .then(res => res.json())
      .then(data => setEvents(data))
  },[])
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridDay"
      events={events}
      editable={true}
      selectable={true}
      select={(info) => {
        const title = prompt('Event title:')
        if (title) {
          fetch('/events',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              title:title,
              start: info.startStr,
              end: info.endStr
            })
          }).then(res => res.json())
          .then(savedEvent => setEvents([...events,savedEvent]))
        }
      }
      }
    />
  );
}

export default Calendar