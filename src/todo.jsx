import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { parseDragMeta, sortEventSegs } from '@fullcalendar/core/internal'
import { useEditor, EditorContent,useEditorState } from '@tiptap/react'
import { ListKit } from '@tiptap/extension-list'
import StarterKit from '@tiptap/starter-kit'
import { supabase } from './supabaseClient'
import { EditorState } from '@tiptap/pm/state'

function Todo({ savedNotes, onNotesChange }) {
    const [page, setPage] = useState('todo')
    const [notes, setNotes] = useState('')
    const [schedule, setSchedule] = useState('')
    const [loading,setLoading] = useState(false)
  
    const editor = useEditor({
            extensions: [
                StarterKit,
                ListKit,
            ],
            content: savedNotes || '<p>what do you need to do today :D</p>',
            onUpdate: ({ editor }) => {
                onNotesChange(editor.getHTML())
            }
        })

    const modifier = useEditor({
            extensions: [StarterKit],
            content: '<p>modify ur schedule :D</p>',
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
            const description = event.description
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
        const date = new Date().toLocaleDateString('en-CA')
        try {
            const { data: { session }} = await supabase.auth.getSession()
            const res = await fetch(`${import.meta.env.VITE_API_URL}/todo`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({notes, date})
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

    const saveModifications = async () => {
        if (!modifier) return
        setLoading(true)
        const notes = modifier.getText()
        const date = new Date().toLocaleDateString('EN-CA')
        try {
            const { data: { session }} = await supabase.auth.getSession()
            console.log('fethcing modificaiotns,',{ notes, schedule, date, token: session.access_token})
            const res = await fetch(`${import.meta.env.VITE_API_URL}/modifications`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({notes, schedule, date})
            })
            console.log('reutned stats',res)
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
                console.log(eventsCalendar)
                alert(`modification sucessful!`)
        } 
         catch (err){
            console.error('scammed again - ',err)
            console.log(schedule)
            alert(`modification failed :(`)
        } 
        finally {setLoading(false)}

    }


    
  return (
    <>
        {page === 'todo' && 
            (<><div className="cheese">
                <div className="toolbar">
                    <button onClick={()=>editor.chain().focus().toggleTaskList().run()} className="btn btn-neutral ml-4">task list :)</button>
                    <button className="btn btn-neutral text-ploot-button-text m-3" onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        bold :)
                    </button>

                </div>
                <EditorContent className="textarea border-ploot-text bg-ploot-outline text-ploot--text m-3 min-w-[600px]" placeholder="bio" editor={editor}></EditorContent>
                <button className="btn btn-neutral text-ploot-button-text m-3" onClick={saveNotes} disabled={loading}>
                {loading && <span className="loading loading-spinner loading-xs"></span>}
                {loading ? "generating schedule" : "save"}
                </button>

                
            </div></>)}
        {page === 'schedule' && 
            (<><div className="yes">
                <div className="calendar-section">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridDay"
                        className="m-3"
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
                        <button className="btn btn-neutral text-ploot-button-text mt-3" onClick={acceptCalendar} disabled={loading}> {loading && <span className="loading loading-spinner loading-xs"></span>}{loading ? "saving..." : "accept calendar"}</button>
        
                </div>
                <div className="modifying-seciton">
                    <EditorContent className="textarea border-ploot-text bg-ploot-outline text-ploot--text m-3 min-w-[500px]" editor={modifier} placeholder="what do you want to modify"></EditorContent>
                    <button className="btn btn-neutral text-ploot-buton-text" onClick={saveModifications} disabled={loading} >{loading && <span className="loading loading-spinner loading-xs"></span>}{loading ? "fixing ur schedule.." : "save"}</button>
                </div>

        </div></>)}
    </>
    
  );
}

export default Todo