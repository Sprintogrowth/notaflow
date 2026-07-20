'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { C } from '@/lib/constants'

const DEMO_USERS = [
  { label: 'Super Admin', email: 'sonia@wonderworldgroup.com', password: 'NotaFlow2024!' },
  { label: 'Notario Titular', email: 'jordi@barcelo-notaria.es', password: 'NotaFlow2024!' },
  { label: 'Oficial', email: 'nuria@barcelo-notaria.es', password: 'NotaFlow2024!' },
]

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const router  = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const quickFill = (u: typeof DEMO_USERS[0]) => {
    setEmail(u.email)
    setPassword(u.password)
    setError('')
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg, #0a0f1e 0%, #1e3a5f 100%)",display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:420,marginBottom:12}}>
        <Link href="/" style={{color:"rgba(255,255,255,0.6)",fontSize:13,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6}}>
          ← Volver a la home
        </Link>
      </div>

      <div style={{background:C.white,borderRadius:16,padding:"36px 32px",width:"100%",maxWidth:420,boxShadow:"0 24px 64px rgba(0,0,0,0.4)"}}>
        <div style={{textAlign:"center" as const,marginBottom:28}}>
          <div style={{fontSize:26,fontWeight:800,color:"#0a0f1e",letterSpacing:"-0.5px"}}>⚖️ NotarioFlow</div>
          <div style={{fontSize:13,color:C.gray500,marginTop:4}}>Acceso al sistema de gestión notarial</div>
        </div>

        <div style={{background:"#f8faff",border:`1px solid ${C.blue100}`,borderRadius:10,padding:"12px 14px",marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:700,color:C.blue700,marginBottom:8,textTransform:"uppercase" as const,letterSpacing:"0.5px"}}>
            Demo — Acceso rápido
          </div>
          <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
            {DEMO_USERS.map(u => (
              <button
                key={u.email}
                onClick={() => quickFill(u)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",background:C.white,border:`1px solid ${C.gray200}`,borderRadius:7,cursor:"pointer",textAlign:"left" as const,width:"100%"}}
              >
                <div>
                  <span style={{fontSize:12,fontWeight:600,color:C.gray900}}>{u.label}</span>
                  <span style={{fontSize:11,color:C.gray500,marginLeft:8}}>{u.email}</span>
                </div>
                <span style={{fontSize:11,color:C.blue700,fontWeight:600}}>Usar →</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:C.gray700,marginBottom:6}}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="notario@notaria.com"
              style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${C.gray200}`,borderRadius:8,fontSize:14,color:C.gray900,outline:"none",boxSizing:"border-box" as const}}
            />
          </div>
          <div style={{marginBottom:24}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:C.gray700,marginBottom:6}}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${C.gray200}`,borderRadius:8,fontSize:14,color:C.gray900,outline:"none",boxSizing:"border-box" as const}}
            />
          </div>

          {error && (
            <div style={{background:C.red100,color:C.red600,fontSize:13,padding:"10px 14px",borderRadius:8,marginBottom:16,fontWeight:500}}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{width:"100%",padding:"12px",background:loading?C.gray300:"#0a0f1e",color:C.white,border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer"}}
          >
            {loading ? "Entrando..." : "Entrar al sistema →"}
          </button>
        </form>

        <div style={{marginTop:20,textAlign:"center" as const}}>
          <span style={{fontSize:12,color:C.gray500}}>¿Aún no tienes cuenta? </span>
          <Link href="/register" style={{fontSize:12,color:C.blue700,fontWeight:600,textDecoration:"none"}}>Registrar notaría</Link>
        </div>
      </div>
    </div>
  )
}
