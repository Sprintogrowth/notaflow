'use client'
import { useState } from 'react'
import Link from 'next/link'
import { C, PLANES } from '@/lib/constants'

const features = [
  { icon:"🤖", titulo:"NotaBot 24/7",           desc:"Agente IA que capta leads, responde consultas y agenda citas mientras tu notaría duerme. Conectado a web, WhatsApp e Instagram." },
  { icon:"📋", titulo:"Minutas con IA",          desc:"Redacta borradores de minutas notariales en segundos. Estructura fija legal, con marcadores [PENDIENTE] para completar." },
  { icon:"🏛️", titulo:"Modelo 600 ITP/AJD",     desc:"Calculadora oficial para Cataluña actualizada con Decreto-ley 5/2025. Tipos progresivos, perfiles reducidos y AJD completos." },
  { icon:"📁", titulo:"Expedientes Kanban",      desc:"Gestiona el ciclo completo de cada operación: documentación → revisión → firma → tramitación." },
  { icon:"👥", titulo:"CRM de Leads",            desc:"Centraliza todos los leads de WhatsApp, Instagram, web y teléfono. Filtra, prioriza y convierte en citas o expedientes." },
  { icon:"📅", titulo:"Agenda inteligente",      desc:"Organiza todas las firmas del día. Confirmaciones automáticas, recordatorios WhatsApp y vinculación con expedientes." },
  { icon:"💰", titulo:"Facturación y aranceles", desc:"Calcula aranceles notariales según RD 1426/1989, emite facturas y controla el estado de cobros en un solo panel." },
  { icon:"🔐", titulo:"Roles y permisos",        desc:"Notario titular, oficial, auxiliar y solo lectura. Cada rol ve exactamente lo que necesita. Control total del acceso." },
]

const testimonios = [
  { nombre:"Jordi Barceló",      rol:"Notario titular · Barcelona", texto:"NotaFlow transformó nuestra notaría. Antes perdíamos leads en Instagram. Ahora el NotaBot los capta, les informa y agenda la cita. Hemos aumentado un 35% las escrituras mensuales.", ini:"JB", color:"#1B4FD8" },
  { nombre:"María Rodríguez",    rol:"Notaria titular · Madrid",    texto:"La calculadora del Modelo 600 nos ahorra 30 minutos por operación. Y las minutas de IA son un punto de partida excepcional para nuestros redactores.", ini:"MR", color:"#7C3AED" },
  { nombre:"Carme Puigdomènech", rol:"Oficial de notaría · Girona", texto:"Por fin tengo todo en un lugar: mis expedientes, la agenda, los leads. Ya no pierdo tiempo buscando en carpetas de correo.", ini:"CP", color:"#059669" },
]

const faqs = [
  { q:"¿Cuánto tiempo tarda la configuración inicial?",   a:"Alta en 5 minutos. Sin instalación, sin IT. El onboarding guiado te lleva paso a paso." },
  { q:"¿Funciona solo para Cataluña o para toda España?", a:"NotaFlow funciona para cualquier notaría española. El Modelo 600 ITP/AJD incluye la escala de Cataluña (actualizada con DL 5/2025)." },
  { q:"¿Puedo cancelar en cualquier momento?",            a:"Sí, sin permanencia ni penalizaciones. Si cancelas antes del próximo ciclo de facturación, no se realiza ningún cargo adicional." },
  { q:"¿El NotaBot reemplaza a mi equipo?",               a:"No, lo potencia. El agente IA atiende consultas rutinarias 24/7 para que tu equipo se centre en lo que aporta valor real." },
  { q:"¿Está adaptado al Reglamento Notarial español?",  a:"Sí. Las minutas generadas por IA son borradores orientativos que siempre requieren revisión notarial. NotaFlow no ejerce ni asesora jurídicamente." },
  { q:"¿Qué pasa con mis datos?",                        a:"Alojamiento en servidores europeos (GDPR compliant). Supabase + SSL. En producción, 2FA activado para roles administrativos." },
]

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [anual, setAnual] = useState(false)

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" })

  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", color:C.text, background:"#fff", minHeight:"100vh" }}>

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, padding:"0 5%" }}>
        <div style={{ display:"flex", alignItems:"center", height:64, maxWidth:1200, margin:"0 auto" }}>
          <div style={{ fontSize:22, fontWeight:900, letterSpacing:.5, flex:1 }}>Nota<span style={{ color:C.primary }}>Flow</span></div>
          <div style={{ display:"flex", justifyContent:"center", gap:36, alignItems:"center", flex:2 }}>
            {[["Funcionalidades","features"],["Precios","precios"],["FAQ","faq"]].map(([l,s]) => (
              <span key={s} onClick={() => scrollTo(s)} style={{ fontSize:13.5, fontWeight:500, color:C.muted, cursor:"pointer" }}>{l}</span>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flex:1, justifyContent:"flex-end" }}>
            <Link href="/login" style={{ fontSize:13, fontWeight:600, color:C.text, padding:"7px 14px", borderRadius:8, textDecoration:"none" }}>Iniciar sesión</Link>
            <Link href="/register" style={{ background:`linear-gradient(135deg,${C.primary},#4F46E5)`, color:"#fff", padding:"9px 20px", borderRadius:9, fontWeight:700, fontSize:13.5, textDecoration:"none", boxShadow:`0 4px 14px ${C.primary}44` }}>Empezar gratis →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background:"linear-gradient(135deg,#0F2D6B 0%,#1e3a8a 50%,#1B4FD8 100%)", padding:"90px 5% 80px", position:"relative", overflow:"hidden" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", gap:60, alignItems:"center", flexWrap:"wrap", position:"relative" }}>
          <div style={{ flex:1, minWidth:320 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", padding:"6px 16px", borderRadius:999, marginBottom:24 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ADE80", display:"inline-block" }}/>
              <span style={{ fontSize:12.5, color:"rgba(255,255,255,0.9)", fontWeight:600 }}>+127 notarías en España ya usan NotaFlow</span>
            </div>
            <h1 style={{ fontSize:46, fontWeight:900, color:"#fff", lineHeight:1.1, marginBottom:20, letterSpacing:-1 }}>
              La plataforma<br/>
              <span style={{ background:"linear-gradient(90deg,#93C5FD,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>inteligente</span><br/>
              para notarías
            </h1>
            <p style={{ fontSize:17, color:"rgba(255,255,255,0.75)", lineHeight:1.6, marginBottom:32, maxWidth:480 }}>
              CRM, expedientes, minutas con IA, Modelo 600 ITP/AJD y un agente que capta leads y agenda citas 24/7. Todo en un solo lugar, desde el primer día.
            </p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
              <Link href="/register" style={{ background:"#fff", color:C.primary, padding:"14px 28px", borderRadius:10, fontWeight:800, fontSize:15, textDecoration:"none", boxShadow:"0 8px 24px rgba(0,0,0,.2)", display:"inline-block" }}>Empezar 14 días gratis →</Link>
              <Link href="/login" style={{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", padding:"14px 24px", borderRadius:10, fontWeight:600, fontSize:14, textDecoration:"none", display:"inline-block" }}>Ver demo en vivo</Link>
            </div>
            <div style={{ marginTop:20, fontSize:12.5, color:"rgba(255,255,255,0.5)", display:"flex", gap:20, flexWrap:"wrap" }}>
              {["✓ Sin tarjeta de crédito","✓ Alta en 5 minutos","✓ Cancela cuando quieras"].map(t => <span key={t}>{t}</span>)}
            </div>
          </div>
          {/* Dashboard preview mockup */}
          <div style={{ flex:1, minWidth:300, maxWidth:460 }}>
            <div style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:16, padding:16, backdropFilter:"blur(8px)" }}>
              <div style={{ display:"flex", gap:5, marginBottom:12 }}>
                {["#ff5f57","#febc2e","#28c840"].map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c }}/>)}
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                {[["3","Leads nuevos"],["6","Citas hoy"],["4","Exp. activos"]].map(([n,l]) => (
                  <div key={l} style={{ flex:1, background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:800, color:"#fff" }}>{n}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
              {[
                { n:"Marta Ferrer", t:"Compraventa", e:"Nuevo", c:"#3B82F6" },
                { n:"Josep Maria Puig", t:"Testamento", e:"Contactado", c:"#D97706" },
                { n:"Anna Vidal", t:"Poder Notarial", e:"Cita agendada", c:"#059669" },
              ].map((r,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:8, background:"rgba(255,255,255,0.07)", borderRadius:8, marginBottom:5 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:r.c+"44", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>{r.n[0]}</div>
                  <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{r.n}</div><div style={{ fontSize:10, color:"rgba(255,255,255,0.5)" }}>{r.t}</div></div>
                  <div style={{ fontSize:10, padding:"2px 8px", borderRadius:999, background:r.c+"33", color:r.c, fontWeight:600 }}>{r.e}</div>
                </div>
              ))}
              <div style={{ marginTop:10, background:"rgba(27,79,216,0.6)", borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                <span>🤖</span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.8)" }}>NotaBot: 3 consultas nuevas en las últimas 2h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background:"#0F2D6B", padding:"28px 5%" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"space-around" }}>
          {[["127+","Notarías activas"],["18.400+","Expedientes gestionados"],["94%","Tasa de satisfacción"],["38%","Más citas con NotaBot"],["< 8s","Respuesta promedio IA"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center", padding:"8px 24px" }}>
              <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:-1 }}>{n}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding:"100px 5%", background:C.bg }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ display:"inline-block", background:C.blueBg2, color:C.primary, padding:"4px 14px", borderRadius:999, fontSize:12, fontWeight:700, marginBottom:12 }}>Funcionalidades</div>
            <h2 style={{ fontSize:34, fontWeight:900, letterSpacing:-.5, marginBottom:14 }}>Todo lo que tu notaría necesita</h2>
            <p style={{ fontSize:16, color:C.muted, maxWidth:540, margin:"0 auto" }}>Una sola plataforma reemplaza cuatro herramientas distintas.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
            {features.map((f,i) => (
              <div key={i} style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:14, padding:22 }}>
                <div style={{ fontSize:32, marginBottom:12 }}>{f.icon}</div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:7 }}>{f.titulo}</div>
                <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" style={{ padding:"80px 5%", background:"linear-gradient(135deg,#0F2D6B,#1e3a8a)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"inline-block", background:"rgba(255,255,255,0.12)", color:"#93C5FD", padding:"4px 14px", borderRadius:999, fontSize:12, fontWeight:700, marginBottom:12 }}>Sin permanencia · Cancela cuando quieras</div>
            <h2 style={{ fontSize:34, fontWeight:900, letterSpacing:-.5, marginBottom:12, color:"#fff" }}>Planes para cada notaría</h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.65)", marginBottom:24 }}>Desde 197 €/mes. Todo incluido, sin sorpresas.</p>
            <div style={{ display:"inline-flex", background:"rgba(255,255,255,0.1)", borderRadius:10, padding:4 }}>
              <div onClick={() => setAnual(false)} style={{ padding:"8px 20px", borderRadius:7, cursor:"pointer", fontSize:13, fontWeight:600, background:!anual?"#fff":"transparent", color:!anual?C.primary:"rgba(255,255,255,0.7)" }}>Mensual</div>
              <div onClick={() => setAnual(true)} style={{ padding:"8px 20px", borderRadius:7, cursor:"pointer", fontSize:13, fontWeight:600, background:anual?"#fff":"transparent", color:anual?C.primary:"rgba(255,255,255,0.7)", display:"flex", alignItems:"center", gap:6 }}>
                Anual <span style={{ background:"#059669", color:"#fff", fontSize:10, padding:"1px 6px", borderRadius:999, fontWeight:700 }}>-17%</span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center" }}>
            {Object.values(PLANES).map(p => (
              <div key={p.id} style={{ flex:"1 1 280px", maxWidth:340, background:p.popular?"#fff":"rgba(255,255,255,0.06)", border:p.popular?`3px solid ${p.color}`:"1px solid rgba(255,255,255,0.15)", borderRadius:16, overflow:"hidden" }}>
                {p.popular && <div style={{ background:p.color, color:"#fff", textAlign:"center", padding:"6px 0", fontSize:12, fontWeight:700 }}>⭐ MÁS POPULAR</div>}
                <div style={{ padding:24 }}>
                  <div style={{ fontWeight:700, fontSize:16, color:p.popular?C.text:"#fff", marginBottom:6 }}>{p.nombre}</div>
                  <div style={{ marginBottom:4 }}>
                    <span style={{ fontSize:40, fontWeight:900, color:p.popular?C.text:"#fff" }}>{anual ? p.precioAnual : p.precio}€</span>
                    <span style={{ fontSize:13, color:p.popular?C.muted:"rgba(255,255,255,0.6)" }}>/mes</span>
                  </div>
                  {anual && <div style={{ fontSize:11, color:p.popular?C.green:"#86EFAC", marginBottom:6, fontWeight:600 }}>Ahorras {(p.precio - p.precioAnual)*12}€/año</div>}
                  <p style={{ fontSize:12.5, color:p.popular?C.muted:"rgba(255,255,255,0.6)", marginBottom:16, lineHeight:1.5 }}>{p.descripcion}</p>
                  <Link href="/register" style={{ display:"block", padding:"11px", borderRadius:9, background:p.popular?p.color:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, fontSize:13.5, textAlign:"center", textDecoration:"none", marginBottom:18 }}>
                    {p.popular ? "Empezar gratis →" : "Probar 14 días →"}
                  </Link>
                  {p.features.map((f,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, fontSize:12.5, color:f.ok?(p.popular?C.text:"rgba(255,255,255,0.85)"):"rgba(255,255,255,0.3)" }}>
                      <span style={{ color:f.ok?(p.popular?p.color:"#86EFAC"):"rgba(255,255,255,0.2)", fontSize:13 }}>{f.ok?"✓":"✕"}</span>
                      <span style={{ textDecoration:f.ok?"none":"line-through" }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ padding:"80px 5%", background:C.bg }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"inline-block", background:C.purpleBg, color:C.purple, padding:"4px 14px", borderRadius:999, fontSize:12, fontWeight:700, marginBottom:12 }}>Testimonios</div>
            <h2 style={{ fontSize:34, fontWeight:900, letterSpacing:-.5 }}>Lo que dicen las notarías</h2>
          </div>
          <div style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
            {testimonios.map((t,i) => (
              <div key={i} style={{ flex:"1 1 280px", background:"#fff", border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
                <div style={{ fontSize:40, color:t.color, marginBottom:8, lineHeight:1, fontFamily:"Georgia,serif" }}>&ldquo;</div>
                <p style={{ fontSize:14, lineHeight:1.7, color:C.text, marginBottom:20 }}>{t.texto}</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:t.color+"22", color:t.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14 }}>{t.ini}</div>
                  <div><div style={{ fontWeight:700, fontSize:13.5 }}>{t.nombre}</div><div style={{ fontSize:12, color:C.muted }}>{t.rol}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding:"80px 5%", background:"#fff" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"inline-block", background:C.amberBg, color:C.amber, padding:"4px 14px", borderRadius:999, fontSize:12, fontWeight:700, marginBottom:12 }}>FAQ</div>
            <h2 style={{ fontSize:34, fontWeight:900, letterSpacing:-.5 }}>Preguntas frecuentes</h2>
          </div>
          {faqs.map((f,i) => (
            <div key={i} onClick={() => setFaqOpen(faqOpen===i ? null : i)} style={{ border:`1px solid ${faqOpen===i?C.primary:C.border}`, borderRadius:12, marginBottom:8, overflow:"hidden", cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:faqOpen===i?C.blueBg:"#fff" }}>
                <span style={{ fontWeight:600, fontSize:14, color:faqOpen===i?C.primary:C.text }}>{f.q}</span>
                <span style={{ color:C.muted, fontSize:20, marginLeft:12, flexShrink:0 }}>{faqOpen===i?"−":"+"}</span>
              </div>
              {faqOpen===i && <div style={{ padding:"0 20px 16px", fontSize:13.5, color:C.muted, lineHeight:1.7 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding:"90px 5%", background:`linear-gradient(135deg,${C.primary},#4F46E5,#7C3AED)`, textAlign:"center" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <h2 style={{ fontSize:40, fontWeight:900, color:"#fff", letterSpacing:-1, marginBottom:16 }}>Tu notaría del siglo XXI empieza hoy</h2>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.75)", marginBottom:36, lineHeight:1.6 }}>Únete a las 127 notarías que ya gestionan sus expedientes, leads y minutas con NotaFlow.</p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/register" style={{ background:"#fff", color:C.primary, padding:"15px 36px", borderRadius:12, fontWeight:800, fontSize:16, textDecoration:"none", boxShadow:"0 8px 32px rgba(0,0,0,.2)" }}>Comenzar gratis — 14 días →</Link>
            <Link href="/login" style={{ background:"transparent", color:"#fff", border:"2px solid rgba(255,255,255,0.4)", padding:"15px 28px", borderRadius:12, fontWeight:700, fontSize:15, textDecoration:"none" }}>Ver demo</Link>
          </div>
          <div style={{ marginTop:20, fontSize:13, color:"rgba(255,255,255,0.5)" }}>Sin tarjeta de crédito · Sin permanencia · Soporte en español</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:C.dark, padding:"48px 5% 28px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", gap:40, flexWrap:"wrap", marginBottom:40 }}>
            <div style={{ flex:2, minWidth:220 }}>
              <div style={{ fontSize:24, fontWeight:900, color:"#fff", marginBottom:10 }}>Nota<span style={{ color:"#7DA8FF" }}>Flow</span></div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.7, maxWidth:280 }}>La plataforma de gestión inteligente para notarías. Expedientes, IA, leads y mucho más.</p>
              <div style={{ marginTop:14, fontSize:12, color:"rgba(255,255,255,0.3)" }}>Desarrollado por <span style={{ color:"#7DA8FF", fontWeight:600 }}>The Wonder World Group</span></div>
            </div>
            <div style={{ flex:1, minWidth:140 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:.8, marginBottom:14 }}>Producto</div>
              {[["Funcionalidades","#features"],["Precios","#precios"],["FAQ","#faq"]].map(([l,h]) => (
                <a key={l} href={h} style={{ display:"block", fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:8, textDecoration:"none" }}>{l}</a>
              ))}
            </div>
            <div style={{ flex:1, minWidth:140 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:.8, marginBottom:14 }}>Acceso</div>
              <Link href="/login"    style={{ display:"block", fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:8, textDecoration:"none" }}>Iniciar sesión</Link>
              <Link href="/register" style={{ display:"block", fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:8, textDecoration:"none" }}>Registro</Link>
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, fontSize:12, color:"rgba(255,255,255,0.3)" }}>
            <span>© 2026 NotaFlow · The Wonder World Group · Todos los derechos reservados</span>
            <span>Hecho con ♥ en Barcelona 🇪🇸</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
