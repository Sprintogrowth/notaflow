'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { C, ROL_LABEL, ROL_COLOR, PLAN_COLOR, permisos, ini } from '@/lib/constants'
import { Profile, Notaria } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { id:"dashboard",   label:"Dashboard",         emoji:"▦",  href:"/dashboard"              },
  { id:"leads",       label:"Leads",             emoji:"👤", href:"/dashboard/leads"        },
  { id:"expedientes", label:"Expedientes",       emoji:"💼", href:"/dashboard/expedientes"  },
  { id:"agenda",      label:"Agenda",            emoji:"📅", href:"/dashboard/agenda"       },
  { id:"agente",      label:"NotaBot IA",        emoji:"🤖", href:"/dashboard/agente"       },
  { id:"facturacion", label:"Facturación",       emoji:"💶", href:"/dashboard/facturacion"  },
]

const TODAY = new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })
  .replace(/^\w/, c => c.toUpperCase())

interface Props {
  profile: Profile
  notaria: Notaria | null
  children: React.ReactNode
  toast?: string | null
}

export function DashboardShell({ profile, notaria, children, toast }: Props) {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()
  const [liveLeads, setLiveLeads] = useState(0)

  const p        = permisos(profile.role)
  const rolData  = ROL_COLOR[profile.role] || ROL_COLOR.oficial
  const planData = notaria ? PLAN_COLOR[notaria.plan as keyof typeof PLAN_COLOR] : null

  useEffect(() => {
    supabase.from('leads').select('id', { count:'exact', head:true })
      .eq('estado', 'nuevo')
      .then(({ count }) => setLiveLeads(count ?? 0))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const currentLabel = NAV.find(n =>
    pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href))
  )?.label ?? "Dashboard"

  const navToShow = NAV.filter(n => {
    if (n.id === 'facturacion' && !p.verFacturacion) return false
    return true
  })

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Inter',-apple-system,sans-serif", background:C.bg, color:C.text, overflow:"hidden" }}>

      {/* Sidebar */}
      <aside style={{ width:215, background:C.blue900, display:"flex", flexDirection:"column", flexShrink:0 }}>
        {/* Brand */}
        <div style={{ padding:"20px 18px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/" style={{ textDecoration:"none" }}>
            <div style={{ fontSize:21, fontWeight:900, letterSpacing:"-0.5px", lineHeight:1 }}>
              <span style={{ color:"#fff" }}>Nota</span><span style={{ color:"#7DA8FF" }}>Flow</span>
            </div>
          </Link>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {notaria?.nombre || "Notaría"}
          </div>
          {planData && (
            <div style={{ marginTop:6, display:"inline-flex", alignItems:"center", gap:4, background:"rgba(255,255,255,0.1)", padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:700, color:planData.color }}>
              👑 {planData.label}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
          {navToShow.map(n => {
            const active = pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href))
            return (
              <Link key={n.id} href={n.href} style={{ textDecoration:"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 11px", borderRadius:8, cursor:"pointer", marginBottom:2, background:active?"rgba(255,255,255,0.14)":"transparent", color:active?"#fff":"rgba(255,255,255,0.6)", fontSize:12.5, fontWeight:active?700:500 }}>
                  <span style={{ fontSize:14, width:18, textAlign:"center", flexShrink:0 }}>{n.emoji}</span>
                  <span style={{ flex:1 }}>{n.label}</span>
                  {n.id==="leads" && liveLeads > 0 && (
                    <span style={{ background:C.red, fontSize:9.5, fontWeight:700, padding:"1px 5px", borderRadius:999, color:"#fff" }}>{liveLeads}</span>
                  )}
                </div>
              </Link>
            )
          })}
          {/* Admin section for notario_titular */}
          {p.verAdmin && (
            <div style={{ marginTop:6, borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:6 }}>
              <Link href="/dashboard/admin" style={{ textDecoration:"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 11px", borderRadius:8, cursor:"pointer", background:pathname.startsWith('/dashboard/admin')?"rgba(255,255,255,0.14)":"transparent", color:pathname.startsWith('/dashboard/admin')?"#fff":"rgba(255,255,255,0.6)", fontSize:12.5, fontWeight:pathname.startsWith('/dashboard/admin')?700:500 }}>
                  <span style={{ fontSize:14, width:18, textAlign:"center" }}>🛡️</span>
                  <span>Administración</span>
                </div>
              </Link>
            </div>
          )}
        </nav>

        {/* Live count */}
        <div style={{ margin:"0 8px 8px", padding:10, borderRadius:9, background:"rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", marginBottom:2 }}>⚡ En vivo hoy</div>
          <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{liveLeads} <span style={{ fontSize:11, fontWeight:500, color:"rgba(255,255,255,0.5)" }}>leads nuevos</span></div>
        </div>

        {/* User */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", padding:"11px 13px", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", fontWeight:700, flexShrink:0 }}>
            {ini(profile.nombre)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11.5, color:"#fff", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile.nombre}</div>
            <div style={{ fontSize:9.5, color:"rgba(255,255,255,0.45)" }}>{ROL_LABEL[profile.role] || profile.role}</div>
          </div>
          <button onClick={handleLogout} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:16, cursor:"pointer", padding:4 }} title="Cerrar sesión">⏏</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <header style={{ background:"#fff", borderBottom:`1px solid ${C.gray200}`, padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:15.5, fontWeight:700, color:C.gray900, lineHeight:1 }}>{currentLabel}</div>
            <div style={{ fontSize:11, color:C.gray400, marginTop:3, textTransform:"capitalize" }}>{TODAY}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:10.5, fontWeight:700, padding:"3px 10px", borderRadius:20, color:rolData.color, background:rolData.bg }}>{ROL_LABEL[profile.role]}</span>
            <div style={{ position:"relative" }}>
              <span style={{ fontSize:18, cursor:"pointer" }}>🔔</span>
              <div style={{ position:"absolute", top:0, right:0, width:7, height:7, borderRadius:"50%", background:C.red600 }}/>
            </div>
            <div style={{ width:32, height:32, borderRadius:"50%", background:C.blue700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>
              {ini(profile.nombre)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflow:"auto", padding:24 }}>
          {children}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:16, right:16, background:C.text, color:"#fff", padding:"10px 15px", borderRadius:9, fontSize:12.5, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,.18)", zIndex:1000, display:"flex", alignItems:"center", gap:7, maxWidth:320 }}>
          <span style={{ color:"#4ADE80" }}>✓</span> {toast}
        </div>
      )}
    </div>
  )
}
