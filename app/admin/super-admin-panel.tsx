'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { C, PLANES, PLAN_COLOR, ini } from '@/lib/constants'
import { Profile, Notaria } from '@/lib/types'

// Mock notarías to show realistic panel (replace with real Supabase data post-seed)
const MOCK_NOTARIAS = [
  { id:"1", nombre:"Notaría Barceló i Associats", ciudad:"Barcelona", plan:"elite",   mrr:597, estado:"activa",  fechaAlta:"15/01/2026", usuarios:4, contacto:"jordi@barcelo-notaria.es" },
  { id:"2", nombre:"Notaría García Martínez",     ciudad:"Madrid",    plan:"pro",     mrr:397, estado:"activa",  fechaAlta:"03/02/2026", usuarios:3, contacto:"garcia@notaria-gm.es"    },
  { id:"3", nombre:"Notaría Puig i Vidal",        ciudad:"Girona",    plan:"starter", mrr:197, estado:"activa",  fechaAlta:"10/03/2026", usuarios:2, contacto:"puig@notariapuig.es"      },
  { id:"4", nombre:"Notaría López Sanz",          ciudad:"Valencia",  plan:"pro",     mrr:397, estado:"activa",  fechaAlta:"22/03/2026", usuarios:5, contacto:"lopez@notarialopez.es"   },
  { id:"5", nombre:"Notaría Fernández Ruiz",      ciudad:"Sevilla",   plan:"pro",     mrr:397, estado:"activa",  fechaAlta:"01/04/2026", usuarios:2, contacto:"fernandez@nfr.es"        },
  { id:"6", nombre:"Notaría Mas Romeu",           ciudad:"Tarragona", plan:"starter", mrr:0,   estado:"prueba",  fechaAlta:"12/06/2026", usuarios:1, contacto:"mas@notariamasromeu.es"  },
  { id:"7", nombre:"Notaría Herrero Blanco",      ciudad:"Bilbao",    plan:"pro",     mrr:0,   estado:"prueba",  fechaAlta:"18/06/2026", usuarios:2, contacto:"herrero@nhblanco.es"     },
]

interface Props { profile: Profile; notarias: Notaria[] }

export default function SuperAdminPanel({ profile }: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const [tab, setTab]       = useState<"resumen"|"notarias"|"facturacion"|"config">("resumen")
  const [notarias, setNotarias] = useState(MOCK_NOTARIAS)
  const [editPlan, setEditPlan] = useState<string|null>(null)

  const activas  = notarias.filter(n => n.estado === "activa")
  const prueba   = notarias.filter(n => n.estado === "prueba")
  const mrr      = activas.reduce((s,n) => s + n.mrr, 0)
  const arr      = mrr * 12

  function cambiarPlan(id: string, plan: string) {
    const precio = PLANES[plan as keyof typeof PLANES]?.precio ?? 0
    setNotarias(p => p.map(n => n.id===id ? {...n, plan, mrr:precio, estado:"activa"} : n))
    setEditPlan(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems: [string, string, typeof tab][] = [
    ["▦","Resumen","resumen"],
    ["🏛️","Notarías","notarias"],
    ["💶","Facturación","facturacion"],
    ["⚙️","Configuración","config"],
  ]

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Inter',-apple-system,sans-serif" }}>

      {/* Dark sidebar */}
      <div style={{ width:230, background:"#0a0f1e", display:"flex", flexDirection:"column", flexShrink:0, color:"#fff", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding:"20px 18px", borderBottom:"1px solid rgba(255,255,255,0.08)", cursor:"pointer" }} onClick={() => router.push('/')}>
          <div style={{ fontSize:18, fontWeight:800 }}>Nota<span style={{ color:"#7DA8FF" }}>Flow</span></div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2, textTransform:"uppercase", letterSpacing:.8 }}>Panel de plataforma</div>
        </div>
        <div style={{ flex:1, padding:"12px 10px" }}>
          {navItems.map(([icon,label,key]) => (
            <div key={key} onClick={() => setTab(key)} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 11px", borderRadius:8, marginBottom:3, cursor:"pointer", background:tab===key?"rgba(255,255,255,0.1)":"transparent", fontSize:13, fontWeight:tab===key?700:500, color:tab===key?"#fff":"rgba(255,255,255,0.55)" }}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>
        {/* User */}
        <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#D97706,#F59E0B)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:"#fff" }}>
              {ini(profile.nombre)}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:12 }}>{profile.nombre}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Super Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.45)", fontSize:11, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6, padding:"4px 0" }}>
            ⏏ Cerrar sesión
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, overflow:"auto", background:"#0d1117", padding:"26px 30px" }}>

        {/* RESUMEN */}
        {tab === "resumen" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:3 }}>👋 Hola, {profile.nombre.split(" ")[0]}. Estado de NotaFlow.</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
            </div>
            {/* KPI cards */}
            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              {[
                ["MRR Total", mrr.toLocaleString("es-ES",{style:"currency",currency:"EUR"}), "+12% vs mayo", "💹", "#059669"],
                ["ARR Proyectado", arr.toLocaleString("es-ES",{style:"currency",currency:"EUR"}), null, "📈", "#7C3AED"],
                ["Notarías activas", activas.length, `+ ${prueba.length} en prueba`, "🏛️", "#1B4FD8"],
                ["Ticket medio", `${Math.round(mrr/Math.max(activas.length,1))} €/mes`, null, "💳", "#D97706"],
              ].map(([l,v,d,icon,col]) => (
                <div key={l as string} style={{ flex:"1 1 170px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>{l}</div>
                      <div style={{ fontSize:22, fontWeight:700, color:"#fff" }}>{v}</div>
                      {d && <div style={{ fontSize:11, color:"#4ADE80", marginTop:3, fontWeight:600 }}>{d}</div>}
                    </div>
                    <div style={{ width:34, height:34, borderRadius:9, background:(col as string)+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{icon}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Plan breakdown */}
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:16 }}>
              {Object.entries(PLANES).map(([pid, p]) => {
                const cnt = notarias.filter(n => n.plan===pid && n.estado==="activa").length
                const pc  = PLAN_COLOR[pid as keyof typeof PLAN_COLOR]
                return (
                  <div key={pid} style={{ flex:"1 1 150px", background:"rgba(255,255,255,0.04)", border:`1px solid ${pc.color}33`, borderRadius:10, padding:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
                      <span style={{ fontSize:13, color:pc.color, fontWeight:700 }}>{pc.label}</span>
                    </div>
                    <div style={{ fontSize:26, fontWeight:800, color:"#fff" }}>{cnt}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{(cnt * p.precio).toLocaleString("es-ES")} €/mes</div>
                  </div>
                )
              })}
            </div>
            {/* Recent notarías */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:16 }}>
              <div style={{ fontWeight:700, color:"#fff", marginBottom:12, fontSize:13 }}>Últimas notarías</div>
              {notarias.slice(0,4).map(n => {
                const pc = PLAN_COLOR[n.plan as keyof typeof PLAN_COLOR]
                return (
                  <div key={n.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🏛️</div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:"#fff", fontWeight:600, fontSize:12.5 }}>{n.nombre}</div>
                      <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{n.ciudad} · Alta {n.fechaAlta}</div>
                    </div>
                    <span style={{ fontSize:11.5, fontWeight:600, color:pc?.color||C.muted, background:(pc?.color||C.primary)+"22", padding:"3px 10px", borderRadius:20 }}>{pc?.label||n.plan}</span>
                    <span style={{ fontSize:11.5, fontWeight:600, color:n.estado==="activa"?C.green:C.amber, background:n.estado==="activa"?C.greenBg:C.amberBg, padding:"3px 10px", borderRadius:20 }}>{n.estado}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* NOTARÍAS */}
        {tab === "notarias" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:17, fontWeight:700, color:"#fff" }}>Notarías ({notarias.length})</div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"rgba(255,255,255,0.05)" }}>
                    {["Notaría","Plan","Estado","MRR","Alta","Usuarios","Acciones"].map(h => (
                      <th key={h} style={{ padding:"10px 14px", fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", textAlign:"left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notarias.map(n => {
                    const pc = PLAN_COLOR[n.plan as keyof typeof PLAN_COLOR]
                    return (
                      <tr key={n.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ color:"#fff", fontWeight:600, fontSize:12.5 }}>{n.nombre}</div>
                          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{n.ciudad} · {n.contacto}</div>
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          {editPlan === n.id ? (
                            <select defaultValue={n.plan} onChange={e => cambiarPlan(n.id, e.target.value)}
                              style={{ padding:"4px 8px", borderRadius:6, border:"1px solid rgba(255,255,255,0.2)", background:"#1e2433", color:"#fff", fontSize:11.5 }}>
                              {Object.entries(PLANES).map(([k,p]) => <option key={k} value={k}>{p.nombre}</option>)}
                            </select>
                          ) : (
                            <span style={{ fontSize:11.5, fontWeight:600, color:pc?.color||C.muted, background:(pc?.color||C.primary)+"22", padding:"3px 10px", borderRadius:20 }}>{pc?.label||n.plan}</span>
                          )}
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          <span style={{ fontSize:11.5, fontWeight:600, color:n.estado==="activa"?C.green:C.amber, background:n.estado==="activa"?C.greenBg:C.amberBg, padding:"3px 10px", borderRadius:20 }}>{n.estado}</span>
                        </td>
                        <td style={{ padding:"11px 14px", color:n.mrr>0?"#4ADE80":"rgba(255,255,255,0.3)", fontWeight:700, fontSize:12.5 }}>{n.mrr>0 ? `${n.mrr} €` : "Prueba"}</td>
                        <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.5)", fontSize:11.5 }}>{n.fechaAlta}</td>
                        <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.5)", fontSize:11.5 }}>{n.usuarios}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ display:"flex", gap:5 }}>
                            <button onClick={() => setEditPlan(editPlan===n.id?null:n.id)} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.6)", padding:"4px 9px", borderRadius:6, cursor:"pointer", fontSize:10.5, fontFamily:"inherit" }}>
                              {editPlan===n.id ? "✕" : "Cambiar plan"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FACTURACIÓN */}
        {tab === "facturacion" && (
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:"#fff", marginBottom:16 }}>Facturación de la plataforma</div>
            <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
              {[["MRR Actual", mrr.toLocaleString("es-ES",{style:"currency",currency:"EUR"})],["ARR Proyectado",arr.toLocaleString("es-ES",{style:"currency",currency:"EUR"})],["Activas",activas.length],["En prueba",prueba.length]].map(([l,v]) => (
                <div key={l as string} style={{ flex:"1 1 130px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:5 }}>{l}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"rgba(255,255,255,0.05)" }}>
                    {["Notaría","Plan","Importe","Estado","Próxima factura"].map(h => (
                      <th key={h} style={{ padding:"10px 14px", fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", textAlign:"left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notarias.map(n => {
                    const pc = PLAN_COLOR[n.plan as keyof typeof PLAN_COLOR]
                    return (
                      <tr key={n.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding:"11px 14px", color:"#fff", fontSize:12.5, fontWeight:600 }}>{n.nombre}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <span style={{ fontSize:11.5, fontWeight:600, color:pc?.color||C.muted, background:(pc?.color||C.primary)+"22", padding:"3px 10px", borderRadius:20 }}>{pc?.label||n.plan}</span>
                        </td>
                        <td style={{ padding:"11px 14px", color:"#4ADE80", fontWeight:700, fontSize:12.5 }}>{n.mrr>0 ? `${n.mrr} €/mes` : "0 € (prueba)"}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <span style={{ fontSize:11.5, fontWeight:600, color:n.estado==="activa"?C.green:C.amber, background:n.estado==="activa"?C.greenBg:C.amberBg, padding:"3px 10px", borderRadius:20 }}>
                            {n.estado==="activa" ? "Al corriente" : "En prueba"}
                          </span>
                        </td>
                        <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.4)", fontSize:11.5 }}>{n.estado==="activa" ? "19/07/2026" : "—"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONFIG */}
        {tab === "config" && (
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:"#fff", marginBottom:16 }}>Configuración de la plataforma</div>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              <div style={{ flex:2, minWidth:300, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:20 }}>
                <div style={{ fontWeight:700, color:"#fff", marginBottom:14, fontSize:13 }}>Datos del producto</div>
                {[
                  ["Nombre","NotaFlow"],
                  ["Empresa","The Wonder World Group · CIF B56844384"],
                  ["Versión","MVP v4.0 — Junio 2026"],
                  ["Stack","Next.js 14 · Supabase · Claude API · Stripe"],
                  ["Estado","Producción activa"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)", fontSize:12.5 }}>
                    <span style={{ color:"rgba(255,255,255,0.4)" }}>{k}</span>
                    <span style={{ color:"#fff", fontWeight:600, fontSize:12 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ flex:1, minWidth:240, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:18 }}>
                <div style={{ fontWeight:700, color:"#fff", marginBottom:12, fontSize:13 }}>Acceso super admin</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:3 }}>Email</div>
                <div style={{ fontSize:12.5, color:"#fff", fontWeight:600, marginBottom:10 }}>sonia@wonderworldgroup.com</div>
                <div style={{ background:"rgba(217,119,6,0.15)", border:"1px solid rgba(217,119,6,0.25)", borderRadius:8, padding:10, fontSize:11.5, color:"#FCD34D", lineHeight:1.5 }}>
                  ⚠️ En producción: Supabase Auth + 2FA activado para super_admin.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
