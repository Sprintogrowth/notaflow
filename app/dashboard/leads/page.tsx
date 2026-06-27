'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lead } from '@/lib/types'
import { C, TIPO_ACTO, CANALES, DOCS_POR_TIPO, estadoLead } from '@/lib/constants'
import { Card, Btn, Inp, Sel, Av, pill } from '@/components/ui'

const ESTADO_LABELS = Object.entries(estadoLead) as [string, { label: string; c: string; bg: string }][]

export default function LeadsPage() {
  const [leads,      setLeads]      = useState<Lead[]>([])
  const [sel,        setSel]        = useState<Lead | null>(null)
  const [filtro,     setFiltro]     = useState('todos')
  const [busq,       setBusq]       = useState('')
  const [showNew,    setShowNew]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [calling,    setCalling]    = useState(false)
  const [callStatus, setCallStatus] = useState<string | null>(null)
  const [form,       setForm]       = useState({ nombre:'', tipo:TIPO_ACTO[0], canal:CANALES[0], tel:'', email:'', msg:'' })

  const supabase = createClient()

  const iniciarLlamadaIA = async (lead: Lead) => {
    if (!lead.tel) { setCallStatus('Sin número de teléfono'); return }
    setCalling(true)
    setCallStatus(null)
    try {
      const res = await fetch('/api/retell/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_phone: lead.tel, lead_id: lead.id }),
      })
      const data = await res.json()
      setCallStatus(res.ok ? `✓ Llamada iniciada (${data.call_id})` : `Error: ${data.error}`)
    } catch {
      setCallStatus('Error al conectar con Retell')
    } finally {
      setCalling(false)
    }
  }

  const load = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (data) setLeads(data)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const lista = leads.filter(l =>
    (filtro === 'todos' || l.estado === filtro) &&
    (l.nombre.toLowerCase().includes(busq.toLowerCase()) || l.tipo.toLowerCase().includes(busq.toLowerCase()))
  )

  const cambiarEstado = async (id: number, estado: string) => {
    await supabase.from('leads').update({ estado }).eq('id', id)
    setLeads(p => p.map(l => l.id === id ? { ...l, estado: estado as Lead['estado'] } : l))
    if (sel?.id === id) setSel(p => p && ({ ...p, estado: estado as Lead['estado'] }))
  }

  const crear = async () => {
    if (!form.nombre.trim()) return
    setSaving(true)
    const { data } = await supabase.from('leads').insert({ ...form, estado:'nuevo', urgencia:'media' }).select().single()
    if (data) setLeads(p => [data, ...p])
    setShowNew(false)
    setForm({ nombre:'', tipo:TIPO_ACTO[0], canal:CANALES[0], tel:'', email:'', msg:'' })
    setSaving(false)
  }

  if (sel) return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <Btn v="ghost" onClick={() => setSel(null)}>← Volver</Btn>
        <span style={{fontSize:13,color:C.gray500}}>Leads / {sel.nombre}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
        <div>
          <Card title="Información del lead">
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
              <Av name={sel.nombre} size={48}/>
              <div>
                <div style={{fontSize:17,fontWeight:700}}>{sel.nombre}</div>
                <div style={{fontSize:12,color:C.gray500,marginTop:2}}>{sel.tipo} · vía {sel.canal}</div>
              </div>
            </div>
            <div style={{height:1,background:C.gray100,margin:"12px 0"}}/>
            {([["Teléfono",sel.tel],["Email",sel.email],["Canal",sel.canal],["Urgencia",sel.urgencia]] as [string,string|null][]).map(([k,v]) => (
              <div key={k} style={{display:"flex",padding:"9px 0",borderBottom:`1px solid ${C.gray100}`}}>
                <span style={{width:140,fontSize:12,color:C.gray500,flexShrink:0}}>{k}</span>
                <span style={{fontSize:13,fontWeight:500}}>{v ?? "—"}</span>
              </div>
            ))}
            {sel.msg && (
              <div style={{marginTop:14}}>
                <div style={{fontSize:12,color:C.gray500,marginBottom:8}}>Mensaje del cliente</div>
                <div style={{background:C.blue50,border:`1px solid ${C.blue100}`,borderRadius:10,padding:14,fontSize:13,color:C.gray700,lineHeight:1.6}}>"{sel.msg}"</div>
              </div>
            )}
          </Card>
          <Card title="Documentos necesarios">
            {(DOCS_POR_TIPO[sel.tipo] ?? []).map((d, i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.gray100}`}}>
                <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${C.gray300}`,flexShrink:0}}/>
                <span style={{fontSize:13,color:C.gray700}}>{d}</span>
              </div>
            ))}
            <div style={{marginTop:14}}><Btn full>📤 Enviar lista al cliente por WhatsApp</Btn></div>
          </Card>
        </div>
        <div>
          <Card title="Estado del lead">
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {ESTADO_LABELS.map(([k, v]) => (
                <button key={k} onClick={() => cambiarEstado(sel.id, k)} style={{padding:"10px 14px",borderRadius:8,border:`2px solid ${sel.estado===k?v.c:C.gray200}`,background:sel.estado===k?v.bg:C.white,color:sel.estado===k?v.c:C.gray700,fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left"}}>
                  {sel.estado===k?"✓ ":""}{v.label}
                </button>
              ))}
            </div>
          </Card>
          <Card title="Acciones rápidas">
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Btn full onClick={() => sel && iniciarLlamadaIA(sel)} disabled={calling}>
                {calling ? 'Iniciando llamada…' : '📞 Llamada IA (Retell)'}
              </Btn>
              {callStatus && <div style={{fontSize:11,color:callStatus.startsWith('✓')?C.green600:C.red600,padding:'4px 0'}}>{callStatus}</div>}
              <Btn full v="outline">💬 Enviar WhatsApp</Btn>
              <Btn full v="outline">📅 Agendar cita</Btn>
              <Btn full v="ghost">📁 Crear expediente</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        {([['todos','Todos'],['nuevo','Nuevos'],['contactado','Contactados'],['cita_agendada','Con cita']] as [string,string][]).map(([k,l]) => (
          <button key={k} onClick={() => setFiltro(k)} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${filtro===k?C.blue700:C.gray200}`,background:filtro===k?C.blue700:C.white,color:filtro===k?C.white:C.gray700,fontSize:12,fontWeight:600,cursor:"pointer"}}>
            {l} ({k==='todos' ? leads.length : leads.filter(l2 => l2.estado===k).length})
          </button>
        ))}
        <Inp value={busq} onChange={e => setBusq(e.target.value)} placeholder="Buscar..." style={{marginLeft:"auto",width:200}}/>
        <Btn onClick={() => setShowNew(true)}>+ Nuevo lead</Btn>
      </div>

      {showNew && (
        <Card title="Registrar lead" mb={16}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Nombre</div><Inp value={form.nombre} onChange={e => setForm({...form,nombre:e.target.value})} placeholder="Carmen Ruiz" style={{width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Tipo de acto</div><Sel value={form.tipo} onChange={e => setForm({...form,tipo:e.target.value})} options={TIPO_ACTO} style={{width:"100%"}}/></div>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Canal</div><Sel value={form.canal} onChange={e => setForm({...form,canal:e.target.value})} options={CANALES} style={{width:"100%"}}/></div>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Teléfono</div><Inp value={form.tel} onChange={e => setForm({...form,tel:e.target.value})} placeholder="+34 600 000 000" style={{width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          <textarea value={form.msg} onChange={e => setForm({...form,msg:e.target.value})} placeholder="Mensaje del cliente..." style={{width:"100%",minHeight:70,padding:10,border:`1.5px solid ${C.gray200}`,borderRadius:8,fontSize:13,resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",marginBottom:12}}/>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={crear} disabled={saving}>Guardar</Btn>
            <Btn v="ghost" onClick={() => setShowNew(false)}>Cancelar</Btn>
          </div>
        </Card>
      )}

      <Card noPad>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:C.gray50}}>
              {["Cliente","Tipo","Canal","Estado","Urgencia","Acción"].map(h => (
                <th key={h} style={{fontSize:11,fontWeight:600,color:C.gray400,textAlign:"left",padding:"10px 16px",textTransform:"uppercase",letterSpacing:"0.4px"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(l => {
              const est = estadoLead[l.estado as keyof typeof estadoLead]
              return (
                <tr key={l.id} onClick={() => setSel(l)} style={{borderTop:`1px solid ${C.gray100}`,cursor:"pointer"}} onMouseEnter={e => (e.currentTarget.style.background=C.gray50)} onMouseLeave={e => (e.currentTarget.style.background=C.white)}>
                  <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Av name={l.nombre} size={28}/><span style={{fontSize:13,fontWeight:600}}>{l.nombre}</span></div></td>
                  <td style={{padding:"12px 16px",fontSize:13,color:C.gray700}}>{l.tipo}</td>
                  <td style={{padding:"12px 16px",fontSize:13,color:C.gray700}}>{l.canal}</td>
                  <td style={{padding:"12px 16px"}}>{est ? pill(est.label,est.c,est.bg) : l.estado}</td>
                  <td style={{padding:"12px 16px"}}>{pill(l.urgencia, l.urgencia==='alta'?C.red600:C.amber600, l.urgencia==='alta'?C.red100:C.amber100)}</td>
                  <td style={{padding:"12px 16px"}} onClick={e => e.stopPropagation()}><Btn sm onClick={() => setSel(l)}>Ver</Btn></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {lista.length === 0 && <div style={{padding:40,textAlign:"center",color:C.gray400,fontSize:14}}>No hay leads.</div>}
      </Card>
    </div>
  )
}
