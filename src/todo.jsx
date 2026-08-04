import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { parseDragMeta, sortEventSegs } from '@fullcalendar/core/internal'
import { useEditor, EditorContent,useEditorState } from '@tiptap/react'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import StarterKit from '@tiptap/starter-kit'
import { supabase } from './supabaseClient'

function Todo() {
    const [page, setPage] = useState('todo')
    const [notes, setNotes] = useState('')
    const [schedule, setSchedule] = useState('')
    const [loading,setLoading] = useState(false)
  
    const editor = useEditor({
            extensions: [StarterKit, TaskItem, TaskList, TaskItem.configure({nested:true,})],
            content: '<p>what do you need to do today?</p>'
        })
    
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
            (<><div class="cheese">
                <div class="toolbar">
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
                <EditorContent editor={editor} class="potato"/>
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
            eventClick={(info)=>{
                alert(`${info.event.title}\n\n${info.event.extendedProps.description}`)
            }}
            />

        </div></>)}
    </>
    
  );
}

export default Todo