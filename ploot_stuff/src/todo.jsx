import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { parseDragMeta, sortEventSegs } from '@fullcalendar/core/internal'

function Todo() {
    const [page, setPage] = useState('todo')
    const [notes, setNotes] = useState('')
    const [schedule, setSchedule] = useState('')
  

    const saveNotes = () => {
        fetch('/todo',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({notes})
        })
        .then(res => res.json())
        .then(
            
            data =>{
                let cleaned = data.schedule.trim()
                cleaned = cleaned.replace(/^```json\n?/, '').replace(/```$/,'')
                const parsed = JSON.parse(cleaned)
                const eventsCalendar = parsed.map(item => ({
                    title: item.title,
                    start: item.start,
                    end: item.end,
                    extendedProps: {
                        description: item.description,
                    }
                }))
                setSchedule(eventsCalendar)
            setPage('schedule')}
        ).catch(err => console.error('scammed again - ',err))
    }


  return (
    <>
        {page === 'todo' && 
            (<><div>
            <textarea
                value={notes}
                onChange={ (e) => setNotes(e.target.value)} 
                rows={20}
                columns={60}
                placeholder='write your todolist/plans for today' >
            </textarea>
            <button onClick={saveNotes}>save</button>
        </div></>)}
        {page === 'schedule' && 
            (<><div>
            <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            events={schedule}
            eventClick={(info)=>{
                alert(`${info.event.title}\n\n${info.event.extendedProps.description}`)
            }}
            />

        </div></>)}
    </>
    
  );
}

export default Todo