'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Expediente, ExpedienteDoc } from '@/lib/types'
import { C, TIPO_ACTO, DOCS_POR_TIPO, estadoExp, fEur } from '@/lib/constants'
import { Card, Btn, Inp, Sel, pill } from '@/components/ui'

type ExpedienteWithDocs = Expediente & { docs: ExpedienteDoc[] }

const ESTS = Object.keys(estadoExp) as (keyof typeof estadoExp)[]

function MinutaView({ exp, onBack }: { exp: ExpedienteWithDocs; onBack: () => void }) {
  const [minuta, setMinuta]   = useState("")
  const [loading, setLoading] = useState(false)
  const [generada, setGenerada] = useState(false)
  const [copied, setCopied]   = useState(false)

  async function generar() {
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{
            role:"user",
            content:`Genera una minuta notarial completa para:\nTipo: ${exp.tipo}\nCliente: ${exp.cliente}\nValor: ${exp.valor ? `${exp.valor.toLocaleString("es-ES")} €` : "por determinar"}\nNotaría: Barceló i Associats, Pau Claris 162 4-1, Barcelona\nNotario: Jordi Barceló Puig\nExpediente: ${exp.id}\n\nREGLAS: (1) Nunca frase incompleta. (2) Termina con firma y punto final. (3) Usa [PENDIENTE: dato] para datos desconocidos. Estructura: ENCABEZADO → ANTE MÍ → COMPARECEN → EXPONEN → OTORGAN (cláusulas numeradas) → ADVERTENCIAS → DILIGENCIA DE FIRMA. Solo el texto de la minuta.`
          }],
          system:"Eres un notario redactor de minutas notariales españolas. Las minutas que generas son borradores orientativos que siempre requieren revisión y autorización notarial."
        })
      })
      const data = await res.json()
      setMinuta(data.content || data.error || "Error al generar.")
      setGenerada(true)
    } catch {
      setMinuta("Error de conexión.")
      setGenerada(true)
    }
    setLoading(false)
  }

  return (
    <div>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.blue700, fontWeight:600, fontSize:12.5, cursor:"pointer", marginBottom:14, display:"flex", alignItems:"center", gap:5, padding:0 }}>← Volver al expediente</button>
      <Card style={{ padding:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700 }}>Generación de minuta con IA</div>
            <div style={{ fontSize:11.5, color:C.gray500 }}>{exp.tipo} · {exp.cliente} · {exp.id}</div>
          </div>
          <span style={{ fontSize:11, fontWeight:600, color:C.blue700, background:C.blue100, padding:"3px 10px", borderRadius:20 }}>IA · Claude</span>
        </div>
        <div style={{ background:C.amber100, borderRadius:7, padding:10, fontSize:12.5, color:"#92400E", marginBottom:14 }}>
          ⚠️ Borrador orientativo. Siempre revisar y autorizar antes de elevar a escritura pública.
        </div>
        {!generada && (
          <>
            <Btn onClick={generar} disabled={loading}>{loading ? "Generando..." : "📝 Generar minuta con IA"}</Btn>
            {loading && <div style={{ fontSize:12, color:C.gray500, marginTop:10 }}>Redactando minuta…</div>}
          </>
        )}
        {generada && (
          <div>
            <div style={{ display:"flex", gap:7, marginBottom:10, flexWrap:"wrap" as const }}>
              <Btn v="outline" sm onClick={() => { navigator.clipboard.writeText(minuta); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                {copied ? "¡Copiado! ✓" : "📋 Copiar"}
              </Btn>
              <Btn v="outline" sm onClick={async () => {
                const res = await fetch('/api/minuta/export', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ minuta, expediente: exp }),
                })
                if (res.ok) {
                  const blob = await res.blob()
                  const url  = URL.createObjectURL(blob)
                  const a    = document.createElement('a')
                  a.href = url
                  a.download = `minuta_${exp.id}.docx`
                  a.click()
                  URL.revokeObjectURL(url)
                }
              }}>
                📄 Exportar .docx
              </Btn>
              <Btn v="ghost" sm onClick={() => { setGenerada(false); setMinuta("") }}>Regenerar</Btn>
            </div>
            <textarea value={minuta} onChange={e => setMinuta(e.target.value)}
              style={{ width:"100%", height:460, padding:"14px", border:`1.5px solid ${C.gray200}`, borderRadius:8, fontFamily:"'Georgia',serif", fontSize:13, lineHeight:1.7, background:"#FAFAF8", resize:"vertical", boxSizing:"border-box", color:C.gray900 }}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default function ExpedientesPage() {
  const router = useRouter()
  const [exps,    setExps]    = useState<ExpedienteWithDocs[]>([])
  const [sel,     setSel]     = useState<ExpedienteWithDocs | null>(null)
  const [vista,   setVista]   = useState<'kanban'|'lista'>('kanban')
  const [showMinuta, setShowMinuta] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({ cliente:'', tipo:TIPO_ACTO[0], valor:'' })

  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase
      .from('expedientes')
      .select('*, docs:expediente_docs(*)')
      .order('created_at', { ascending: false })
    if (data) setExps(data as ExpedienteWithDocs[])
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cambiarEstado = async (id: string, estado: string) => {
    await supabase.from('expedientes').update({ estado }).eq('id', id)
    setExps(p => p.map(e => e.id === id ? { ...e, estado: estado as Expediente['estado'] } : e))
    if (sel?.id === id) setSel(p => p && ({ ...p, estado: estado as Expediente['estado'] }))
  }

  const toggleDoc = async (docId: number, recibido: boolean) => {
    await supabase.from('expediente_docs').update({ recibido }).eq('id', docId)
    setExps(p => p.map(e => ({ ...e, docs: e.docs.map(d => d.id === docId ? { ...d, recibido } : d) })))
    if (sel) setSel(p => p && ({ ...p, docs: p.docs.map(d => d.id === docId ? { ...d, recibido } : d) }))
  }

  const crear = async () => {
    if (!form.cliente.trim()) return
    setSaving(true)
    const id = `EXP-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`
    const { data: exp } = await supabase.from('expedientes')
      .insert({ id, cliente: form.cliente, tipo: form.tipo, valor: parseInt(form.valor)||null, estado:'documentacion', urgente:false })
      .select().single()
    if (exp) {
      const docsToInsert = (DOCS_POR_TIPO[form.tipo] ?? []).map(nombre => ({ expediente_id: id, nombre, recibido: false }))
      const { data: docs } = await supabase.from('expediente_docs').insert(docsToInsert).select()
      setExps(p => [{ ...exp, docs: docs ?? [] }, ...p])
    }
    setShowNew(false)
    setForm({ cliente:'', tipo:TIPO_ACTO[0], valor:'' })
    setSaving(false)
  }

  if (sel && showMinuta) {
    return <MinutaView exp={sel} onBack={() => setShowMinuta(false)}/>
  }

  if (sel) {
    const cfg = estadoExp[sel.estado as keyof typeof estadoExp]
    const ok  = sel.docs.filter(d => d.recibido).length
    const pct = sel.docs.length ? Math.round(ok / sel.docs.length * 100) : 0
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <Btn v="ghost" onClick={() => { setSel(null); setShowMinuta(false) }}>← Volver</Btn>
          <span style={{fontSize:13,color:C.gray500}}>Expedientes / {sel.id}</span>
          <span style={{marginLeft:"auto"}}>{cfg && pill(cfg.label,cfg.c,cfg.bg)}{sel.urgente && <span style={{marginLeft:8,fontSize:11,color:C.red600,fontWeight:700}}>⚡ URGENTE</span>}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
          <div>
            <Card title="Datos del expediente">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {([["Nº Expediente",sel.id],["Cliente",sel.cliente],["Tipo de acto",sel.tipo],["Valor escritura",fEur(sel.valor)],["Fecha apertura",sel.fecha_apertura]] as [string,string][]).map(([k,v]) => (
                  <div key={k} style={{padding:"8px 0",borderBottom:`1px solid ${C.gray100}`}}>
                    <div style={{fontSize:11,color:C.gray400,marginBottom:2}}>{k}</div>
                    <div style={{fontSize:13,fontWeight:600}}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card title={`Documentación — ${ok}/${sel.docs.length} recibidos`}>
              <div style={{height:6,background:C.gray100,borderRadius:3,marginBottom:14,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:pct===100?C.green600:C.blue700,borderRadius:3}}/>
              </div>
              {sel.docs.map(doc => (
                <div key={doc.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.gray100}`}}>
                  <div onClick={() => toggleDoc(doc.id, !doc.recibido)} style={{width:20,height:20,borderRadius:5,border:`2px solid ${doc.recibido?C.green600:C.gray300}`,background:doc.recibido?C.green600:C.white,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                    {doc.recibido && <span style={{color:C.white,fontSize:11,fontWeight:800}}>✓</span>}
                  </div>
                  <span style={{fontSize:13,flex:1}}>{doc.nombre}</span>
                  <span style={{fontSize:11,fontWeight:600,color:doc.recibido?C.green600:C.red600}}>{doc.recibido?"Recibido":"Pendiente"}</span>
                </div>
              ))}
              <div style={{marginTop:14,display:"flex",gap:8}}>
                <Btn>📤 Solicitar docs al cliente</Btn>
              </div>
            </Card>
          </div>
          <div>
            <Card title="Cambiar estado">
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {ESTS.map(k => {
                  const v = estadoExp[k]
                  return (
                    <button key={k} onClick={() => cambiarEstado(sel.id, k)} style={{padding:"10px 14px",borderRadius:8,border:`2px solid ${sel.estado===k?v.col:C.gray200}`,background:sel.estado===k?v.bg:C.white,color:sel.estado===k?v.c:C.gray700,fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left"}}>
                      {sel.estado===k?"✓ ":""}{v.label}
                    </button>
                  )
                })}
              </div>
            </Card>
            <Card title="Acciones">
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <Btn full>📧 Notificar al cliente</Btn>
                <Btn full v="outline">💬 Estado por WhatsApp</Btn>
                <Btn full v="ghost" onClick={() => router.push('/dashboard/facturacion?tab=modelo600')}>🏛️ Modelo 600 ITP/AJD</Btn>
                <Btn full v="ghost">🏛️ Enviar a Registro</Btn>
                <Btn full v="outline" onClick={() => setShowMinuta(true)}>📝 Generar minuta IA</Btn>
                {sel.estado!=="cerrado" && <Btn full v="danger" onClick={() => cambiarEstado(sel.id,"cerrado")}>✓ Cerrar expediente</Btn>}
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        {(['kanban','lista'] as const).map(v => (
          <button key={v} onClick={() => setVista(v)} style={{padding:"7px 16px",borderRadius:8,border:`1.5px solid ${vista===v?C.blue700:C.gray200}`,background:vista===v?C.blue700:C.white,color:vista===v?C.white:C.gray700,fontSize:12,fontWeight:600,cursor:"pointer"}}>
            {v==="kanban"?"⬜ Kanban":"☰ Lista"}
          </button>
        ))}
        <span style={{fontSize:13,color:C.gray500,marginLeft:4}}>{exps.filter(e=>e.estado!=="cerrado").length} activos</span>
        <div style={{marginLeft:"auto"}}><Btn onClick={() => setShowNew(true)}>+ Nuevo expediente</Btn></div>
      </div>

      {showNew && (
        <Card title="Abrir expediente" mb={16}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Cliente</div><Inp value={form.cliente} onChange={e => setForm({...form,cliente:e.target.value})} placeholder="Nombre del cliente" style={{width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Tipo de acto</div><Sel value={form.tipo} onChange={e => setForm({...form,tipo:e.target.value})} options={TIPO_ACTO} style={{width:"100%"}}/></div>
            <div><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>Valor (€)</div><Inp value={form.valor} onChange={e => setForm({...form,valor:e.target.value})} placeholder="320000" style={{width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={crear} disabled={saving}>Abrir</Btn>
            <Btn v="ghost" onClick={() => setShowNew(false)}>Cancelar</Btn>
          </div>
        </Card>
      )}

      {vista==="kanban" ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
          {ESTS.map(est => {
            const cfg   = estadoExp[est]
            const items = exps.filter(e => e.estado === est)
            return (
              <div key={est} style={{background:C.gray50,borderRadius:10,padding:12,minHeight:200,borderTop:`3px solid ${cfg.col}`}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",color:cfg.c,marginBottom:10}}>{cfg.label} ({items.length})</div>
                {items.map(exp => {
                  const ok2  = exp.docs.filter(d => d.recibido).length
                  const pct2 = exp.docs.length ? Math.round(ok2/exp.docs.length*100) : 0
                  return (
                    <div key={exp.id} onClick={() => setSel(exp)} style={{background:C.white,borderRadius:8,padding:12,marginBottom:8,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",cursor:"pointer",border:`1px solid ${exp.urgente?C.red100:C.gray100}`}}>
                      {exp.urgente && <div style={{fontSize:10,color:C.red600,fontWeight:700,marginBottom:4}}>⚡ URGENTE</div>}
                      <div style={{fontSize:11,color:C.gray400,fontWeight:600}}>{exp.id}</div>
                      <div style={{fontSize:13,fontWeight:700,margin:"3px 0 2px",lineHeight:1.3}}>{exp.cliente}</div>
                      <div style={{fontSize:11,color:C.gray500}}>{exp.tipo}</div>
                      {exp.valor && <div style={{fontSize:12,fontWeight:600,color:C.blue700,marginTop:4}}>{fEur(exp.valor)}</div>}
                      <div style={{height:4,background:C.gray100,borderRadius:2,marginTop:8,overflow:"hidden"}}>
                        <div style={{width:`${pct2}%`,height:"100%",background:pct2===100?C.green600:cfg.col,borderRadius:2}}/>
                      </div>
                      <div style={{fontSize:10,color:C.gray400,marginTop:4}}>📎 {ok2}/{exp.docs.length}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      ) : (
        <Card noPad>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:C.gray50}}>{["Expediente","Cliente","Tipo","Valor","Estado","Docs","Acción"].map(h => <th key={h} style={{fontSize:11,fontWeight:600,color:C.gray400,textAlign:"left",padding:"10px 14px",textTransform:"uppercase",letterSpacing:"0.4px"}}>{h}</th>)}</tr></thead>
            <tbody>
              {exps.map(exp => {
                const cfg2 = estadoExp[exp.estado as keyof typeof estadoExp]
                const ok3  = exp.docs.filter(d => d.recibido).length
                return (
                  <tr key={exp.id} onClick={() => setSel(exp)} style={{borderTop:`1px solid ${C.gray100}`,cursor:"pointer"}} onMouseEnter={e=>(e.currentTarget.style.background=C.gray50)} onMouseLeave={e=>(e.currentTarget.style.background=C.white)}>
                    <td style={{padding:"11px 14px",fontSize:12,fontWeight:700,color:C.blue700}}>{exp.id}</td>
                    <td style={{padding:"11px 14px",fontSize:13}}>{exp.cliente}</td>
                    <td style={{padding:"11px 14px",fontSize:12,color:C.gray500}}>{exp.tipo}</td>
                    <td style={{padding:"11px 14px",fontSize:13,fontWeight:600,color:C.blue700}}>{fEur(exp.valor)}</td>
                    <td style={{padding:"11px 14px"}}>{cfg2 && pill(cfg2.label,cfg2.c,cfg2.bg)}</td>
                    <td style={{padding:"11px 14px",fontSize:12,fontWeight:600,color:ok3===exp.docs.length?C.green600:C.amber600}}>{ok3}/{exp.docs.length}</td>
                    <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}><Btn sm onClick={() => setSel(exp)}>Ver</Btn></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
