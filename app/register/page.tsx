'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { C, PLANES } from '@/lib/constants'

type Step = 1 | 2 | 3 | 4

export default function RegisterPage() {
  const router  = useRouter()
  const supabase = createClient()

  const [step, setStep]     = useState<Step>(1)
  const [plan, setPlan]     = useState<'starter'|'pro'|'elite'>('pro')
  const [notaria, setNotaria] = useState({ nombre:"", cif:"", direccion:"", telefono:"", email:"" })
  const [admin, setAdmin]   = useState({ nombre:"", email:"", password:"", confirm:"" })
  const [err, setErr]       = useState("")
  const [loading, setLoading] = useState(false)

  const inp: React.CSSProperties = { padding:"9px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.text, width:"100%", boxSizing:"border-box", outline:"none", background:"#fff" }
  const lbl: React.CSSProperties = { display:"block", fontSize:12, fontWeight:600, color:C.muted, marginBottom:5 }

  function validateStep2() {
    if (!notaria.nombre.trim() || !notaria.email.trim()) { setErr("Nombre y email son obligatorios"); return false }
    setErr(""); return true
  }

  function validateStep3() {
    if (!admin.nombre.trim() || !admin.email.trim() || !admin.password) { setErr("Todos los campos son obligatorios"); return false }
    if (admin.password !== admin.confirm) { setErr("Las contraseñas no coinciden"); return false }
    if (admin.password.length < 8) { setErr("La contraseña debe tener mínimo 8 caracteres"); return false }
    setErr(""); return true
  }

  async function handleCreate() {
    if (!validateStep3()) return
    setLoading(true)
    setErr("")
    try {
      const { data, error } = await supabase.auth.signUp({
        email: admin.email,
        password: admin.password,
        options: {
          data: {
            nombre: admin.nombre,
            role: 'notario_titular',
            notaria_nombre: notaria.nombre,
            plan,
          }
        }
      })
      if (error) throw error

      // Get the notaria_id created by the trigger
      const notaria_id = data.user?.user_metadata?.notaria_id
        ?? (await supabase.from('notarias').select('id').eq('nombre', notaria.nombre).single()).data?.id

      if (notaria_id) {
        // Redirect to Stripe Checkout
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, billing: 'monthly', notaria_id }),
        })
        const { url } = await res.json()
        if (url) { window.location.href = url; return }
      }

      // Fallback if Stripe not configured yet
      setStep(4)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  const planData = PLANES[plan]

  return (
    <div style={{ minHeight:"100vh", background:"#0F2D6B", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:560, overflow:"hidden" }}>

        {/* Header */}
        <div style={{ padding:"18px 26px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:11 }}>
          {step < 4 && (
            <button onClick={() => { if (step === 1) router.push('/login'); else setStep(s => (s-1) as Step) }}
              style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:20, padding:0, lineHeight:1 }}>←</button>
          )}
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>Nota<span style={{ color:C.primary }}>Flow</span> — Registro</div>
            {step < 4 && <div style={{ fontSize:11.5, color:C.muted }}>Paso {step} de 3</div>}
          </div>
        </div>

        {/* Progress bar */}
        {step < 4 && (
          <div style={{ display:"flex", padding:"12px 26px 0", gap:5 }}>
            {[1,2,3].map(s => <div key={s} style={{ flex:1, height:4, borderRadius:999, background:s<=step?C.primary:C.bg2 }}/>)}
          </div>
        )}

        <div style={{ padding:"18px 26px 26px" }}>

          {/* STEP 1 — Plan selection */}
          {step === 1 && <>
            <div style={{ fontWeight:700, fontSize:14.5, marginBottom:3 }}>Elige tu plan</div>
            <div style={{ fontSize:12.5, color:C.muted, marginBottom:14 }}>Puedes cambiarlo en cualquier momento.</div>
            {Object.values(PLANES).map(p => (
              <div key={p.id} onClick={() => setPlan(p.id as 'starter'|'pro'|'elite')}
                style={{ display:"flex", alignItems:"center", gap:13, padding:"12px 14px", borderRadius:9, border:`2px solid ${plan===p.id?p.color:C.border}`, background:plan===p.id?p.color+"06":"#fff", cursor:"pointer", marginBottom:7 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{p.nombre}{p.popular && <span style={{ marginLeft:6, background:p.color, color:"#fff", fontSize:9.5, padding:"1px 6px", borderRadius:999 }}>Popular</span>}</div>
                  <div style={{ fontSize:11.5, color:C.muted }}>{p.precio} €/mes · {p.soporte}</div>
                </div>
                <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${plan===p.id?p.color:C.border}`, background:plan===p.id?p.color:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {plan===p.id && <span style={{ color:"#fff", fontSize:10 }}>✓</span>}
                </div>
              </div>
            ))}
            <button onClick={() => setStep(2)} style={{ width:"100%", padding:"11px", borderRadius:9, background:C.primary, color:"#fff", border:"none", fontWeight:700, fontSize:13.5, cursor:"pointer", marginTop:6, fontFamily:"inherit" }}>
              Continuar con {planData.nombre} →
            </button>
          </>}

          {/* STEP 2 — Notaría data */}
          {step === 2 && <>
            <div style={{ fontWeight:700, fontSize:14.5, marginBottom:3 }}>Datos de tu notaría</div>
            <div style={{ fontSize:12.5, color:C.muted, marginBottom:14 }}>Plan: <strong style={{ color:planData.color }}>{planData.nombre} — {planData.precio} €/mes</strong></div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Nombre de la notaría *</label>
              <input value={notaria.nombre} onChange={e => setNotaria({...notaria, nombre:e.target.value})} placeholder="Ej. Notaría García Martínez" style={inp}/>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>CIF</label>
              <input value={notaria.cif} onChange={e => setNotaria({...notaria, cif:e.target.value})} placeholder="B12345678" style={inp}/>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Dirección</label>
              <input value={notaria.direccion} onChange={e => setNotaria({...notaria, direccion:e.target.value})} placeholder="Calle, número, CP, ciudad" style={inp}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><label style={lbl}>Teléfono</label><input value={notaria.telefono} onChange={e => setNotaria({...notaria, telefono:e.target.value})} placeholder="93 XXX XX XX" style={inp}/></div>
              <div><label style={lbl}>Email *</label><input value={notaria.email} onChange={e => setNotaria({...notaria, email:e.target.value})} placeholder="info@notaria.es" style={inp}/></div>
            </div>
            {err && <div style={{ background:C.redBg, color:C.red, padding:"9px 13px", borderRadius:8, fontSize:12.5, marginBottom:12 }}>{err}</div>}
            <button onClick={() => validateStep2() && setStep(3)} style={{ width:"100%", padding:"11px", borderRadius:9, background:C.primary, color:"#fff", border:"none", fontWeight:700, fontSize:13.5, cursor:"pointer", fontFamily:"inherit" }}>
              Continuar →
            </button>
          </>}

          {/* STEP 3 — Admin account */}
          {step === 3 && <>
            <div style={{ fontWeight:700, fontSize:14.5, marginBottom:3 }}>Cuenta del notario titular</div>
            <div style={{ fontSize:12.5, color:C.muted, marginBottom:14 }}>Tendrá acceso completo y podrá añadir el equipo.</div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Nombre completo *</label>
              <input value={admin.nombre} onChange={e => setAdmin({...admin, nombre:e.target.value})} placeholder="Nombre y apellidos" style={inp}/>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Email *</label>
              <input value={admin.email} onChange={e => setAdmin({...admin, email:e.target.value})} placeholder="notario@notaria.es" style={inp}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div>
                <label style={lbl}>Contraseña *</label>
                <input type="password" value={admin.password} onChange={e => setAdmin({...admin, password:e.target.value})} placeholder="Mín. 8 caracteres" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Confirmar *</label>
                <input type="password" value={admin.confirm} onChange={e => setAdmin({...admin, confirm:e.target.value})} placeholder="Repite" style={inp}/>
              </div>
            </div>
            {err && <div style={{ background:C.redBg, color:C.red, padding:"9px 13px", borderRadius:8, fontSize:12.5, marginBottom:12 }}>{err}</div>}
            <button onClick={handleCreate} disabled={loading} style={{ width:"100%", padding:"11px", borderRadius:9, background:loading?"#94A3B8":C.primary, color:"#fff", border:"none", fontWeight:700, fontSize:13.5, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit" }}>
              {loading ? "Creando cuenta..." : "Crear cuenta gratuita →"}
            </button>
          </>}

          {/* STEP 4 — Success */}
          {step === 4 && (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
              <div style={{ fontSize:19, fontWeight:700, marginBottom:7 }}>¡Cuenta creada!</div>
              <div style={{ fontSize:13, color:C.muted, marginBottom:5, lineHeight:1.6 }}>
                <strong>{notaria.nombre || "Tu notaría"}</strong> con el plan <strong style={{ color:planData.color }}>{planData.nombre}</strong>.
              </div>
              <div style={{ fontSize:13, color:C.muted, marginBottom:8 }}>14 días gratis · Sin tarjeta</div>
              <div style={{ background:C.amberBg, borderRadius:8, padding:"10px 14px", fontSize:12.5, color:"#92400E", marginBottom:22, textAlign:"left" }}>
                📧 Revisa tu email para confirmar la cuenta antes de iniciar sesión.
              </div>
              <button onClick={() => router.push('/login')} style={{ padding:"12px 32px", borderRadius:9, background:C.primary, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
                Ir al inicio de sesión →
              </button>
            </div>
          )}

          {step < 4 && (
            <div style={{ textAlign:"center", marginTop:16, fontSize:12.5, color:C.muted }}>
              ¿Ya tienes cuenta? <Link href="/login" style={{ color:C.primary, fontWeight:600, textDecoration:"none" }}>Iniciar sesión</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
