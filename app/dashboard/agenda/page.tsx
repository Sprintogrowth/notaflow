'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Cita } from '@/lib/types'
import { C, TIPO_ACTO } from '@/lib/constants'
import { Card, Btn, Inp, Sel, pill } from '@/components/ui'

export default function AgendaPage() {
  const [citas,   setCitas]   = useState<Cita[]>([])
  const [sel,     setSel]     = useState<Cita | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [today,   setToday]   = useState(new Date().toISOString().split('T')[0])
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({ cliente:'', tipo:TIPO_ACTO[0], hora:'', sala:'Despacho 1', tel:'' })

  const supabase = createClient()

  const load = async (fecha: string) => {
    const { data } = await supabase.from('agenda').select('*').eq('fecha', fecha).order('hora')
    if (data) setCitas(data)
  }

  useEffect(() => { load(today) }, [today]) // eslint-disable-line react-hooks/exhaustive-deps

  const confirmar = async (id: number) => {
    await supabase.from('agenda').update({ estado:'confirmada' }).eq('id', id)
    setCitas(p => p.map(a => a.id===id ? {...a,estado:'confirmada'} : a))
    if (sel?.id===id) setSel(p => p && {...p,estado:'confirmada'})
  }

  const cancelar = async (id: number) => {
    await supabase.from('agenda').delete().eq('id', id)
    setCitas(p => p.filter(a => a.id!==id))
    if (sel?.id===id) setSel(null)
  }

  const crear = async () => {
    if (!form.cliente || !form.hora) return
    setSaving(true)
    const { data } = await supabase.from('agenda')
      .insert({ ...form, fecha: today, estado:'pendiente' })
      .select().single()
    if (data) setCitas(p => [...p, data].sort((a,b) => a.hora.localeCompare(b.hora)))
    setShowNew(false)
    setForm({ cliente:'', tipo:TIPO_ACTO[0], hora:'', sala:'Despacho 1', tel:'' })
    setSaving(false)
  }

  if (sel) return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <Btn v="ghost" onClick={() => setSel(null)}>← Volver</Btn>
        <span style={{fontSize:13,color:C.gray500}}>Agenda / {sel.hora.slice(0,5)} — {sel.cliente}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
        <Card title="Detalle de la cita">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {([["Cliente",sel.cliente],["Tipo de acto",sel.tipo],["Hora",sel.hora.slice(0,5)],["Sala",sel.sala],["Teléfono",sel.tel||"—"],["Estado",sel.estado],["Expediente vinculado",sel.exp_id||"Sin vincular"]] as [string,string][]).map(([k,v]) => (
              <div key={k} style={{padding:"9px 0",borderBottom:`1px solid ${C.gray100}`}}>
                <div style={{fontSize:11,color:C.gray400,marginBottom:2}}>{k}</div>
                <div style={{fontSize:13,fontWeight:600,textTransform:k==="Estado"?"capitalize":"none"}}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        <div>
          <Card title="Acciones">
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {sel.estado==="pendiente" && (
                <Btn full v="success" onClick={() => { confirmar(sel.id); setSel({...sel,estado:'confirmada'}) }}>✓ Confirmar cita</Btn>
              )}
              <Btn full>💬 Recordatorio por WhatsApp</Btn>
              <Btn full v="ghost">📋 Ir al expediente</Btn>
              <Btn full v="danger" onClick={() => cancelar(sel.id)}>✕ Cancelar cita</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input type="date" value={today} onChange={e => setToday(e.target.value)} style={{padding:"7px 12px",borderRadius:8,border:`1.5px solid ${C.gray200}`,fontSize:13,color:C.gray700}}/>
          <span style={{fontSize:13,color:C.gray500}}>{citas.length} citas</span>
        </div>
        <Btn onClick={() => setShowNew(true)}>+ Nueva cita</Btn>
      </div>

      {showNew && (
        <Card title="Añadir cita" mb={16}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Cliente</div><Inp value={form.cliente} onChange={e => setForm({...form,cliente:e.target.value})} placeholder="Nombre" style={{width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Tipo de acto</div><Sel value={form.tipo} onChange={e => setForm({...form,tipo:e.target.value})} options={TIPO_ACTO} style={{width:"100%"}}/></div>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Hora</div><Inp value={form.hora} onChange={e => setForm({...form,hora:e.target.value})} placeholder="10:30" style={{width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Sala</div><Sel value={form.sala} onChange={e => setForm({...form,sala:e.target.value})} options={["Despacho 1","Despacho 2","Sala de Firmas"]} style={{width:"100%"}}/></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={crear} disabled={saving}>Añadir</Btn>
            <Btn v="ghost" onClick={() => setShowNew(false)}>Cancelar</Btn>
          </div>
        </Card>
      )}

      <Card noPad>
        <div style={{padding:"6px 0"}}>
          {citas.map(a => (
            <div key={a.id} onClick={() => setSel(a)} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 20px",borderBottom:`1px solid ${C.gray100}`,cursor:"pointer",background:C.white}} onMouseEnter={e=>(e.currentTarget.style.background=C.gray50)} onMouseLeave={e=>(e.currentTarget.style.background=C.white)}>
              <div style={{width:52,flexShrink:0,textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:800,color:C.blue700}}>{a.hora.slice(0,5)}</div>
              </div>
              <div style={{width:3,height:44,borderRadius:2,background:a.estado==="confirmada"?C.green600:C.amber600,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700}}>{a.cliente}</div>
                <div style={{fontSize:12,color:C.gray500,marginTop:2}}>{a.tipo} · {a.sala}</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}} onClick={e=>e.stopPropagation()}>
                {pill(a.estado==="confirmada"?"Confirmada":"Pendiente", a.estado==="confirmada"?C.green600:C.amber600, a.estado==="confirmada"?C.green100:C.amber100)}
                {a.estado==="pendiente" && <Btn sm v="success" onClick={() => confirmar(a.id)}>Confirmar</Btn>}
                <Btn sm v="ghost" onClick={() => setSel(a)}>Ver</Btn>
              </div>
            </div>
          ))}
          {citas.length===0 && <div style={{padding:40,textAlign:"center",color:C.gray400,fontSize:14}}>Sin citas para este día.</div>}
        </div>
      </Card>
    </div>
  )
}
