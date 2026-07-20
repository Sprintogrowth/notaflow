'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lead, Expediente, Cita } from '@/lib/types'
import { C, estadoLead, estadoExp, fEur } from '@/lib/constants'
import { Card, StatCard, Av, pill } from '@/components/ui'

export default function DashboardPage() {
  const [leads, setLeads]   = useState<Lead[]>([])
  const [exps,  setExps]    = useState<Expediente[]>([])
  const [agenda, setAgenda] = useState<Cita[]>([])
  const [stripeOk, setStripeOk] = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  useEffect(() => {
    if (searchParams.get('stripe') === 'success') {
      setStripeOk(true)
      setTimeout(() => setStripeOk(false), 6000)
      router.replace('/dashboard')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => data && setLeads(data))
    supabase.from('expedientes').select('*').order('created_at', { ascending: false })
      .then(({ data }) => data && setExps(data))
    supabase.from('agenda').select('*').eq('fecha', new Date().toISOString().split('T')[0]).order('hora')
      .then(({ data }) => data && setAgenda(data))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const nuevos    = leads.filter(l => l.estado === 'nuevo').length
  const urgentes  = exps.filter(e => e.urgente && e.estado !== 'cerrado').length
  const activos   = exps.filter(e => e.estado !== 'cerrado').length

  return (
    <div>
      {stripeOk && (
        <div style={{background:C.greenBg,border:`1px solid ${C.green}`,borderRadius:10,padding:"12px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🎉</span>
          <div>
            <div style={{fontWeight:700,color:C.green,fontSize:13}}>¡Suscripción activada!</div>
            <div style={{fontSize:12,color:C.green}}>Tu prueba gratuita de 14 días ha comenzado. Bienvenido a NotarioFlow.</div>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        <StatCard num={nuevos}        label="Leads nuevos hoy"      delta={`+${nuevos} vs ayer`}                                                           pos={true}  accent={C.blue700}   icon="👥"/>
        <StatCard num={agenda.length} label="Citas hoy"             delta={`${agenda.filter(a=>a.estado==='confirmada').length} confirmadas`}               pos={true}  accent={C.green600}  icon="📅"/>
        <StatCard num={activos}       label="Expedientes activos"   delta={urgentes > 0 ? `${urgentes} urgentes` : undefined}                              pos={urgentes===0} accent={C.amber600} icon="💼"/>
        <StatCard num="—"             label="Facturación del mes"   accent={C.purple600} icon="💶"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16,marginBottom:16}}>
        <Card title="Leads recientes" action="Ver todos →" onAction={() => router.push('/dashboard/leads')}>
          {leads.slice(0,5).map(l => {
            const est = estadoLead[l.estado as keyof typeof estadoLead]
            return (
              <div key={l.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${C.gray100}`}}>
                <Av name={l.nombre}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.nombre}</div>
                  <div style={{fontSize:11,color:C.gray500,marginTop:2}}>{l.tipo}</div>
                </div>
                {est ? pill(est.label, est.c, est.bg) : null}
              </div>
            )
          })}
          {leads.length === 0 && <div style={{color:C.gray400,fontSize:13,textAlign:"center",padding:20}}>No hay leads aún.</div>}
        </Card>

        <Card title="Agenda de hoy" action="Ver todos →" onAction={() => router.push('/dashboard/agenda')}>
          {agenda.map(a => (
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${C.gray100}`}}>
              <span style={{fontSize:13,fontWeight:700,color:C.blue700,width:40,flexShrink:0}}>{a.hora.slice(0,5)}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.cliente}</div>
                <div style={{fontSize:11,color:C.gray500,marginTop:2}}>{a.tipo} · {a.sala}</div>
              </div>
              <div style={{width:9,height:9,borderRadius:"50%",background:a.estado==="confirmada"?C.green600:C.amber600,flexShrink:0}}/>
            </div>
          ))}
          {agenda.length === 0 && <div style={{color:C.gray400,fontSize:13,textAlign:"center",padding:20}}>Sin citas hoy.</div>}
        </Card>
      </div>

      <Card title="Expedientes urgentes">
        {exps.filter(e => e.urgente && e.estado !== 'cerrado').length === 0
          ? <div style={{color:C.gray400,fontSize:13}}>Sin expedientes urgentes.</div>
          : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {exps.filter(e => e.urgente && e.estado !== 'cerrado').map(e => {
                const cfg = estadoExp[e.estado as keyof typeof estadoExp]
                return (
                  <div key={e.id} style={{background:C.red100,borderRadius:10,padding:14,border:`1px solid ${C.red600}33`}}>
                    <div style={{fontSize:10,fontWeight:800,color:C.red600,textTransform:"uppercase"}}>{e.id}</div>
                    <div style={{fontSize:13,fontWeight:700,margin:"4px 0 2px"}}>{e.cliente}</div>
                    <div style={{fontSize:12,color:C.gray700}}>{cfg?.label}</div>
                    {e.valor && <div style={{fontSize:12,fontWeight:600,color:C.blue700,marginTop:4}}>{fEur(e.valor)}</div>}
                  </div>
                )
              })}
            </div>
          )
        }
      </Card>
    </div>
  )
}
