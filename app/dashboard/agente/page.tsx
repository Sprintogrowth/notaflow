'use client'
import { useState, useRef, useEffect } from 'react'
import { C } from '@/lib/constants'
import { Card } from '@/components/ui'

interface Message { role: 'user' | 'bot'; text: string }

const INIT: Message[] = [{ role:'bot', text:'Hola 👋 Soy el asistente de la Notaría Barceló. ¿En qué puedo ayudarle hoy?' }]

export default function AgentePage() {
  const [chat,   setChat]   = useState<Message[]>(INIT)
  const [msg,    setMsg]    = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [chat])

  const send = async () => {
    if (!msg.trim() || typing) return
    const text = msg
    setMsg('')
    setTyping(true)
    setChat(p => [...p, { role:'user', text }])

    try {
      const apiMessages = chat
        .filter(m => m.role !== 'bot' || chat.indexOf(m) > 0)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
      apiMessages.push({ role:'user', content: text })

      const res  = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages: apiMessages }) })
      const data = await res.json()
      setChat(p => [...p, { role:'bot', text: data.text || '¿Quieres que te llame un oficial ahora mismo?' }])
    } catch {
      setChat(p => [...p, { role:'bot', text:'Un momento, te pongo con un oficial de la notaría.' }])
    }
    setTyping(false)
  }

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16,height:"calc(100vh - 160px)"}}>
      <div style={{display:"flex",flexDirection:"column",background:C.white,border:`1px solid ${C.gray200}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{background:C.blue700,padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
          <div>
            <div style={{color:C.white,fontSize:14,fontWeight:700}}>NotaBot · Agente IA</div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>● Activo 24/7 · WhatsApp, Web, Instagram</div>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:20,background:C.gray50,display:"flex",flexDirection:"column",gap:10}}>
          {chat.map((m,i) => (
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"72%",padding:"10px 14px",borderRadius:m.role==="bot"?"4px 12px 12px 12px":"12px 4px 12px 12px",background:m.role==="bot"?C.white:C.blue700,color:m.role==="bot"?C.gray900:C.white,fontSize:13,lineHeight:1.55,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{display:"flex"}}>
              <div style={{padding:"10px 14px",borderRadius:"4px 12px 12px 12px",background:C.white,fontSize:13,color:C.gray400,fontStyle:"italic"}}>Escribiendo...</div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        <div style={{padding:"12px 16px",background:C.white,borderTop:`1px solid ${C.gray200}`,display:"flex",gap:10}}>
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key==="Enter" && send()}
            placeholder='Escribe como cliente: "Quiero hacer un testamento"...'
            style={{flex:1,padding:"10px 14px",border:`1.5px solid ${C.gray200}`,borderRadius:8,fontSize:13,outline:"none"}}
          />
          <button onClick={send} disabled={typing||!msg.trim()} style={{padding:"10px 20px",background:C.blue700,color:C.white,border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:typing||!msg.trim()?"not-allowed":"pointer",opacity:typing||!msg.trim()?0.6:1}}>
            Enviar →
          </button>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:14,overflowY:"auto"}}>
        <Card title="⚡ Acciones">
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {["📅 Ver citas generadas","✏️ Editar respuestas del bot","🔗 Conectar WhatsApp Business","📊 Informe semanal"].map((a,i) => (
              <button key={i} style={{padding:"9px 12px",width:"100%",textAlign:"left",fontSize:12,fontWeight:500,border:`1.5px solid ${C.gray200}`,borderRadius:8,background:C.white,color:C.gray700,cursor:"pointer"}}>{a}</button>
            ))}
          </div>
        </Card>
        <div style={{background:C.blue50,border:`1px solid ${C.blue100}`,borderRadius:12,padding:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.blue700,marginBottom:6}}>💡 Prueba el agente</div>
          <div style={{fontSize:12,color:C.gray500,lineHeight:1.8}}>
            "Quiero hacer testamento"<br/>
            "¿Cuánto cuesta una compraventa?"<br/>
            "Necesito un poder notarial"<br/>
            "Ha fallecido mi padre"
          </div>
        </div>
      </div>
    </div>
  )
}
