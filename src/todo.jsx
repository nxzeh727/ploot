import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { parseDragMeta, sortEventSegs } from '@fullcalendar/core/internal'
import { useEditor, EditorContent,useEditorState } from '@tiptap/react'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import StarterKit from '@tiptap/starter-kit'
import { supabase } from './supabaseClient'

function Todo({ savedNotes, onNotesChange }) {
    const [page, setPage] = useState('todo')
    const [notes, setNotes] = useState('')
    const [schedule, setSchedule] = useState('')
    const [loading,setLoading] = useState(false)
  
    const editor = useEditor({
            extensions: [StarterKit, TaskList, TaskItem.configure({nested:true,})],
            content: savedNotes || 'what do you need to do today :D',
            onUpdate: ({ editor }) => {
                onNotesChange(editor.getHTML())
            }
        })
    const acceptCalendar = () => {
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Ploot//EN'

        ]
        schedule.forEach(event => {
            const start = new Date(event.start).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'
            const end = new Date(event.end).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'
            const title = event.title
            const description = event.extendedProps.description
            lines.push(
            `BEGIN:VEVENT`,
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:${title}`,
            `DECRIPTION:${description}`,
            `END:VEVENT`,
        )
        })
        lines.push(`END:VCALENDAR`)
        const blob = new Blob([lines.join(`\r\n`)], { type: 'text/calendar'})
        const url = URL.createObjectURL(blob)
        const cheese = document.createElement('a')
        cheese.href = url
        cheese.download = 'ploots_sprouts.ics'
        cheese.click()
        URL.revokeObjectURL(url)

    }
    
    const saveNotes = async () => {
        if (!editor) return
        setLoading(true) 
        const notes = editor.getText()
        try {
            const { data: { session }} = await supabase.auth.getSession()
            const res = await fetch(`${import.meta.env.VITE_API_URL}/todo`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({notes})
            })
            const data = await res.json()
            console.log('full response object:',data)
            const raw = data.schedule 
            const start = raw.indexOf('[')
            const end = raw.lastIndexOf(']')

            const cleaned = raw.slice(start, end + 1)
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
            setPage('schedule')
        } catch (err){console.error('scammed again - ',err)} 
        finally {setLoading(false)}
    }
    


    
  return (
    <>
        {page === 'todo' && 
            (<><div className="cheese">
                <div className="toolbar">
                    <button onClick={() => editor.chain().focus().toggleTaskList().run()}
                    >
                        task list :)
                    </button>
                    <button onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        bold :)
                    </button>
                    <button onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        bullet points :)
                    </button>
                </div>
                <EditorContent editor={editor} className="potato"/>
                <button onClick={saveNotes} disabled={loading}>
                {loading ? "generating schedule" : "save"}
                </button>

                
            </div></>)}
        {page === 'schedule' && 
            (<><div>
            <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            events={schedule}
            editable={true}
            eventResizableFromStart={true} 
            eventDrop={(info)=>{
                setSchedule(prev => prev.map(e => 
                    e.title === info.event.title
                    ?  { ... e, start: info.event.startStr, end: info.event.endStr}
                    : e
                ))
            }}
            
            eventResize={(info)=>{
                setSchedule(prev => prev.map(e => 
                    e.title === info.event.title
                    ?  { ... e, start: info.event.startStr, end: info.event.endStr}
                    : e
                ))
            }}
            eventClick={(info)=>{
                alert(`${info.event.title}\n\n${info.event.extendedProps.description}`)
            }}
            />
            <button onClick={acceptCalendar} disabled={loading}> {loading ? "saving..." : "accept calendar"}</button>
            

        </div></>)}
    </>
    
  );
}

export default Todo