'use client'
import { useState } from 'react'
import { C, ROL_LABEL, ROL_COLOR, ROL_PERMISOS } from '@/lib/constants'
import { Card, Btn, Inp, Sel } from '@/components/ui'

const inp: React.CSSProperties = { padding:"9px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.text, width:"100%", boxSizing:"border-box", outline:"none", background:"#fff" }

// Mock users for demo — in production these come from Supabase
const MOCK_USERS = [
  { id:"1", nombre:"Jordi Barceló Puig",  email:"jordi@barcelo-notaria.es", rol:"notario_titular", activo:true  },
  { id:"2", nombre:"Núria Soler Camps",   email:"nuria@barcelo-notaria.es", rol:"oficial",         activo:true  },
  { id:"3", nombre:"Marc Ribera Tort",    email:"marc@barcelo-notaria.es",  rol:"oficial",         activo:true  },
  { id:"4", nombre:"Laura Pons Ferrer",   email:"laura@barcelo-notaria.es", rol:"auxiliar",        activo:false },
]

const MOCK_NOTARIA = {
  nombre: "Notaría Barceló i Associats",
  cif: "B12345678",
  direccion: "Pau Claris 162 4-1, 08008 Barcelona",
  telefono: "93 123 45 67",
  email: "info@barcelo-notaria.es",
  web: "www.barcelo-notaria.es",
  plan: "elite",
}

const INTEGRACIONES = [
  { nombre:"API Anthropic",    icono:"🤖", estado:"Activa",    desc:"NotaBot + Generación de minutas" },
  { nombre:"WhatsApp Business",icono:"💬", estado:"Pendiente", desc:"Twilio · Meta Business requerido" },
  { nombre:"Supabase",         icono:"🗄️", estado:"Pendiente", desc:"Base de datos en producción" },
  { nombre:"Stripe",           icono:"💳", estado:"Pendiente", desc:"Pagos y suscripciones" },
  { nombre:"Retell AI",        icono:"📞", estado:"Pendiente", desc:"Llamadas de voz IA" },
  { nombre:"Resend",           icono:"📧", estado:"Pendiente", desc:"Email automático transaccional" },
]

export default function AdminPage() {
  const [tab, setTab]           = useState<"usuarios"|"configuracion"|"integraciones">("usuarios")
  const [users, setUsers]       = useState(MOCK_USERS)
  const [notaria, setNotaria]   = useState(MOCK_NOTARIA)
  const [showAdd, setShowAdd]   = useState(false)
  const [editUser, setEditUser] = useState<string|null>(null)
  const [toast, setToast]       = useState<string|null>(null)
  const [nuevo, setNuevo]       = useState({ nombre:"", email:"", rol:"oficial" })

  function notify(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2800) }

  function addUser() {
    if (!nuevo.nombre || !nuevo.email) { notify("⚠️ Nombre y email son obligatorios"); return }
    setUsers(p => [...p, { id: String(Date.now()), ...nuevo, activo:true }])
    setNuevo({ nombre:"", email:"", rol:"oficial" })
    setShowAdd(false)
    notify(`✓ Usuario ${nuevo.nombre} creado`)
  }

  function toggleActivo(id: string) {
    const u = users.find(u => u.id === id)
    setUsers(p => p.map(u => u.id === id ? {...u, activo:!u.activo} : u))
    notify(`✓ ${u?.activo ? "Desactivado" : "Activado"}`)
  }

  function cambiarRol(id: string, rol: string) {
    setUsers(p => p.map(u => u.id === id ? {...u, rol} : u))
    setEditUser(null)
    notify("✓ Rol actualizado")
  }

  const rolesSelectables = Object.entries(ROL_LABEL).filter(([k]) => k !== "super_admin")

  return (
    <div>
      {/* Tabs */}
      <div style={{ display:"flex", gap:3, marginBottom:16, background:"#fff", padding:3, borderRadius:7, border:`1px solid ${C.border}`, width:"fit-content", flexWrap:"wrap" }}>
        {[["usuarios","Usuarios y roles"],["configuracion","Configuración"],["integraciones","Integraciones"]].map(([k,l]) => (
          <div key={k} onClick={() => setTab(k as typeof tab)} style={{ padding:"6px 14px", borderRadius:5, cursor:"pointer", fontSize:12, fontWeight:600, background:tab===k?C.blueBg2:"transparent", color:tab===k?C.primary:C.muted }}>
            {l}
          </div>
        ))}
      </div>

      {/* USUARIOS */}
      {tab === "usuarios" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:12.5, color:C.muted }}>{users.length} usuarios</div>
            <button onClick={() => setShowAdd(s => !s)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, background:C.primary, color:"#fff", border:"none", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              + Añadir usuario
            </button>
          </div>

          {showAdd && (
            <div style={{ background:"#fff", border:`1.5px solid ${C.primary}`, borderRadius:12, padding:16, marginBottom:12, borderLeft:`4px solid ${C.primary}` }}>
              <div style={{ fontWeight:700, marginBottom:12, fontSize:13 }}>Nuevo usuario</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div>
                  <label style={{ fontSize:11.5, fontWeight:600, color:C.muted, display:"block", marginBottom:4 }}>Nombre *</label>
                  <input value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre:e.target.value})} placeholder="Nombre y apellidos" style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize:11.5, fontWeight:600, color:C.muted, display:"block", marginBottom:4 }}>Email *</label>
                  <input value={nuevo.email} onChange={e => setNuevo({...nuevo, email:e.target.value})} placeholder="email@notaria.es" style={inp}/>
                </div>
                <div>
                  <label style={{ fontSize:11.5, fontWeight:600, color:C.muted, display:"block", marginBottom:4 }}>Rol</label>
                  <select value={nuevo.rol} onChange={e => setNuevo({...nuevo, rol:e.target.value})} style={inp}>
                    {rolesSelectables.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"flex", gap:7, justifyContent:"flex-end" }}>
                <button onClick={() => setShowAdd(false)} style={{ padding:"7px 14px", borderRadius:7, background:C.bg2, color:C.muted, border:"none", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>Cancelar</button>
                <button onClick={addUser} style={{ padding:"7px 14px", borderRadius:7, background:C.primary, color:"#fff", border:"none", cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600 }}>Crear usuario</button>
              </div>
            </div>
          )}

          <div style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.bg }}>
                  {["Usuario","Email","Rol","Permisos","Estado","Acciones"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", fontSize:10.5, fontWeight:700, color:C.muted, textTransform:"uppercase", textAlign:"left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rc = ROL_COLOR[u.rol] || ROL_COLOR.oficial
                  const p  = ROL_PERMISOS[u.rol as keyof typeof ROL_PERMISOS] || ROL_PERMISOS.solo_lectura
                  return (
                    <tr key={u.id} style={{ borderTop:`1px solid ${C.border}` }}>
                      <td style={{ padding:"11px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:30, height:30, borderRadius:"50%", background:rc.color+"22", color:rc.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:11.5, flexShrink:0 }}>
                            {u.nombre.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase()}
                          </div>
                          <div style={{ fontWeight:600, fontSize:12.5 }}>{u.nombre}</div>
                        </div>
                      </td>
                      <td style={{ padding:"11px 14px", fontSize:11.5, color:C.muted }}>{u.email}</td>
                      <td style={{ padding:"11px 14px" }}>
                        {editUser === u.id ? (
                          <select defaultValue={u.rol} onChange={e => cambiarRol(u.id, e.target.value)} style={{ ...inp, width:160, padding:"4px 8px", fontSize:11.5 }}>
                            {rolesSelectables.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        ) : (
                          <span style={{ fontSize:11.5, fontWeight:600, color:rc.color, background:rc.bg, padding:"3px 10px", borderRadius:20 }}>{ROL_LABEL[u.rol] || u.rol}</span>
                        )}
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {[p.puedeEditar&&"Editar", p.verFacturacion&&"Facturas", p.verAdmin&&"Admin", p.verTodosExpedientes&&"Todos exp."].filter(Boolean).map(tag => (
                            <span key={tag as string} style={{ fontSize:10, padding:"1px 7px", borderRadius:99, background:C.bg2, color:C.muted, fontWeight:600 }}>{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <span style={{ fontSize:11.5, fontWeight:600, color:u.activo?C.green:C.muted, background:u.activo?C.greenBg:C.bg2, padding:"3px 10px", borderRadius:20 }}>{u.activo?"Activo":"Inactivo"}</span>
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <div style={{ display:"flex", gap:5 }}>
                          <button onClick={() => setEditUser(editUser===u.id?null:u.id)} style={{ padding:"4px 9px", borderRadius:6, background:C.bg2, color:C.muted, border:"none", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>
                            {editUser===u.id ? "✕" : "Editar"}
                          </button>
                          <button onClick={() => toggleActivo(u.id)} style={{ padding:"4px 9px", borderRadius:6, background:u.activo?C.redBg:C.greenBg, color:u.activo?C.red:C.green, border:"none", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>
                            {u.activo ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Role reference */}
          <div style={{ marginTop:16, background:"#fff", border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>Referencia de roles</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {Object.entries(ROL_LABEL).filter(([k]) => k !== "super_admin").map(([rol,label]) => {
                const rc = ROL_COLOR[rol] || ROL_COLOR.oficial
                const p  = ROL_PERMISOS[rol as keyof typeof ROL_PERMISOS]
                return (
                  <div key={rol} style={{ flex:"1 1 200px", border:`1px solid ${rc.color}33`, borderRadius:10, padding:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                      <div style={{ width:28, height:28, borderRadius:7, background:rc.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🛡️</div>
                      <div><div style={{ fontWeight:700, fontSize:12.5 }}>{label}</div><div style={{ fontSize:10, color:rc.color }}>{rol}</div></div>
                    </div>
                    {[
                      ["Editar registros", p?.puedeEditar],
                      ["Ver facturación", p?.verFacturacion],
                      ["Todos los expedientes", p?.verTodosExpedientes],
                      ["Panel administración", p?.verAdmin],
                    ].map(([perm, tiene]) => (
                      <div key={perm as string} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:tiene?"#374151":"#94A3B8", marginBottom:3 }}>
                        <span style={{ color:tiene?"#059669":"#CBD5E1" }}>{tiene?"✓":"✕"}</span>{perm}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN */}
      {tab === "configuracion" && (
        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
          <div style={{ flex:2, minWidth:300, background:"#fff", border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Datos de la notaría</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[["Nombre","nombre","Notaría..."],["CIF","cif","B12345678"],["Dirección","direccion","Calle..."],["Teléfono","telefono","93 XXX XX XX"],["Email","email","info@..."],["Web","web","www.notaria.es"]].map(([label,key,ph]) => (
                <div key={key}>
                  <label style={{ fontSize:11.5, fontWeight:600, color:C.muted, display:"block", marginBottom:4 }}>{label}</label>
                  <input value={notaria[key as keyof typeof notaria]} onChange={e => setNotaria({...notaria, [key]:e.target.value})} placeholder={ph} style={inp}/>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:14 }}>
              <button onClick={() => notify("✓ Datos guardados")} style={{ padding:"9px 20px", borderRadius:8, background:C.primary, color:"#fff", border:"none", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Guardar cambios</button>
            </div>
          </div>
          <div style={{ flex:1, minWidth:220 }}>
            <div style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
              <div style={{ fontWeight:700, marginBottom:12, fontSize:13 }}>Plan activo</div>
              <div style={{ background:C.amberBg, borderRadius:10, padding:14, marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span>👑</span><span style={{ fontWeight:700, color:C.amber }}>Notaría Elite</span>
                </div>
                <div style={{ fontSize:24, fontWeight:900, color:C.amber }}>597 €<span style={{ fontSize:12, fontWeight:500, color:C.muted }}>/mes</span></div>
              </div>
              {[["Usuarios","Ilimitados"],["Expedientes","Ilimitados"],["Minutas IA","Ilimitadas"],["NotaBot","WhatsApp + Voz IA"]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                  <span style={{ color:C.muted }}>{k}</span><span style={{ fontWeight:700 }}>{v}</span>
                </div>
              ))}
              <button
                onClick={async () => {
                  const res = await fetch('/api/stripe/portal', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ customer_id: 'demo' }) })
                  const { url } = await res.json()
                  if (url) window.location.href = url
                  else notify("Configura Stripe para gestionar la suscripción")
                }}
                style={{ marginTop:12, width:"100%", padding:"9px", borderRadius:8, background:"#fff", border:`1.5px solid ${C.border}`, fontWeight:600, fontSize:12.5, cursor:"pointer", fontFamily:"inherit" }}
              >
                💳 Gestionar suscripción →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTEGRACIONES */}
      {tab === "integraciones" && (
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {INTEGRACIONES.map(i => (
            <div key={i.nombre} style={{ flex:"1 1 240px", background:"#fff", border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <span style={{ fontSize:22 }}>{i.icono}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:13.5 }}>{i.nombre}</div>
                  <div style={{ fontSize:11.5, color:C.muted }}>{i.desc}</div>
                </div>
              </div>
              <span style={{ fontSize:11.5, fontWeight:600, color:i.estado==="Activa"?C.green:C.amber, background:i.estado==="Activa"?C.greenBg:C.amberBg, padding:"3px 10px", borderRadius:20 }}>
                {i.estado}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:16, right:16, background:C.text, color:"#fff", padding:"10px 15px", borderRadius:9, fontSize:12.5, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,.18)", zIndex:1000, display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ color:"#4ADE80" }}>✓</span> {toast}
        </div>
      )}
    </div>
  )
}
