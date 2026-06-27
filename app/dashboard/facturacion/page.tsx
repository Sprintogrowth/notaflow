'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Factura } from '@/lib/types'
import { C, TIPO_ACTO, PERFILES_ITP, TIPOS_AJD, calcularITP_Cat, calcularPlazoHabil, calcularArancel } from '@/lib/constants'
import { Card, StatCard, Sel, Inp, Btn, pill } from '@/components/ui'

export default function FacturacionPage() {
  const supabase = createClient()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [tab, setTab] = useState<"facturas"|"calculadora"|"modelo600">("facturas")

  // Arancel calculator state
  const [arTipo,  setArTipo]  = useState(TIPO_ACTO[0])
  const [arValor, setArValor] = useState("")

  // Modelo 600 state
  const [modalidad,  setModalidad]  = useState<"tpo"|"ajd"|"os">("tpo")
  const [tipoAJD,    setTipoAJD]    = useState("ajd_hipoteca")
  const [perfil,     setPerfil]     = useState("general")
  const [m6Valor,    setM6Valor]    = useState("")
  const [fecha,      setFecha]      = useState("")
  const [protocolo,  setProtocolo]  = useState("")
  const [nombreSP,   setNombreSP]   = useState("")
  const [nifSP,      setNifSP]      = useState("")
  const [descBien,   setDescBien]   = useState("")

  useEffect(() => {
    supabase.from('facturas').select('*').order('fecha', { ascending:false })
      .then(({ data }) => data && setFacturas(data))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cobradas   = facturas.filter(f => f.estado === 'cobrada')
  const pendientes = facturas.filter(f => f.estado === 'pendiente')
  const totalMes   = cobradas.reduce((s,f) => s + f.total, 0)
  const totalPend  = pendientes.reduce((s,f) => s + f.total, 0)

  // Arancel
  const arBase  = calcularArancel(Number(arValor) || 0)
  const arTotal = arBase * 1.21

  // Modelo 600
  const v600 = Number(m6Valor) || 0
  let resultado600: { cuota:number; tipoDesc:string; tarifa:string; tramos:{label:string;base:number;tipo:number;cuota:number}[]|null } | null = null
  if (modalidad === "os") {
    resultado600 = { cuota:0, tipoDesc:"0% — EXENTO", tarifa:"OS", tramos:null }
  } else if (v600 > 0) {
    if (modalidad === "tpo") {
      resultado600 = calcularITP_Cat(v600, perfil)
    } else {
      const t = TIPOS_AJD.find(x => x.value === tipoAJD) ?? TIPOS_AJD[0]
      resultado600 = {
        cuota: v600 * t.pct / 100,
        tipoDesc: `${t.pct}% — ${t.tarifa}`,
        tarifa: t.tarifa,
        tramos: [{ label:t.label, base:v600, tipo:t.pct, cuota:v600*t.pct/100 }],
      }
    }
  }
  const plazo600 = calcularPlazoHabil(fecha, 30)

  const ss: React.CSSProperties = { background:C.bg, borderRadius:8, padding:11, marginBottom:10 }
  const lbl: React.CSSProperties = { fontSize:10.5, fontWeight:700, color:C.muted, marginBottom:7, textTransform:"uppercase", letterSpacing:.5, display:"block" }
  const inp: React.CSSProperties = { padding:"9px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.text, width:"100%", boxSizing:"border-box", outline:"none", background:"#fff" }

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        <StatCard num={totalMes.toLocaleString('es-ES',{style:"currency",currency:"EUR"})} label="Facturado este mes" pos accent={C.green600}/>
        <StatCard num={totalPend.toLocaleString('es-ES',{style:"currency",currency:"EUR"})} label="Pendiente de cobro" delta={`${pendientes.length} facturas`} pos={false} accent={C.amber600}/>
        <StatCard num={facturas.length} label="Facturas este mes" pos accent={C.blue700}/>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:3, marginBottom:14, background:"#fff", padding:3, borderRadius:7, border:`1px solid ${C.border}`, width:"fit-content", flexWrap:"wrap" }}>
        {[["facturas","📋 Facturas"],["calculadora","🧮 Calculadora aranceles"],["modelo600","🏛️ Modelo 600 ITP/AJD"]].map(([k,l]) => (
          <div key={k} onClick={() => setTab(k as typeof tab)}
            style={{ padding:"6px 14px", borderRadius:5, cursor:"pointer", fontSize:12, fontWeight:600, background:tab===k?C.blueBg2:"transparent", color:tab===k?C.primary:C.muted }}>
            {l}
          </div>
        ))}
      </div>

      {/* FACTURAS TABLE */}
      {tab === "facturas" && (
        <Card noPad>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.bg }}>
                {["Nº Factura","Cliente","Tipo","Base","Total","Estado","Fecha"].map(h => (
                  <th key={h} style={{ fontSize:10.5, fontWeight:700, color:C.muted, textAlign:"left", padding:"10px 14px", textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => (
                <tr key={f.id} style={{ borderTop:`1px solid ${C.gray100}` }}>
                  <td style={{ padding:"11px 14px", fontSize:11.5, fontWeight:600, color:C.gray500 }}>{f.id}</td>
                  <td style={{ padding:"11px 14px", fontSize:13, fontWeight:600 }}>{f.cliente}</td>
                  <td style={{ padding:"11px 14px", fontSize:12 }}>{f.tipo}</td>
                  <td style={{ padding:"11px 14px", fontSize:12 }}>{f.base.toLocaleString('es-ES',{style:"currency",currency:"EUR"})}</td>
                  <td style={{ padding:"11px 14px", fontSize:13, fontWeight:700 }}>{f.total.toLocaleString('es-ES',{style:"currency",currency:"EUR"})}</td>
                  <td style={{ padding:"11px 14px" }}>{pill(f.estado==="cobrada"?"Cobrada":"Pendiente", f.estado==="cobrada"?C.green600:C.amber600, f.estado==="cobrada"?C.green100:C.amber100)}</td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:C.gray500 }}>{f.fecha}</td>
                </tr>
              ))}
              {facturas.length === 0 && (
                <tr><td colSpan={7} style={{ padding:24, textAlign:"center", color:C.muted, fontSize:13 }}>No hay facturas registradas aún.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* ARANCEL CALCULATOR */}
      {tab === "calculadora" && (
        <Card style={{ maxWidth:500, padding:20 }}>
          <div style={{ fontWeight:700, marginBottom:14, fontSize:14 }}>Calculadora de aranceles notariales</div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Tipo de acto</label>
            <Sel value={arTipo} onChange={e => setArTipo(e.target.value)} options={TIPO_ACTO}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Valor del acto (€)</label>
            <Inp value={arValor} onChange={e => setArValor(e.target.value)} placeholder="Ej. 150000"/>
          </div>
          <div style={{ background:C.blueBg, borderRadius:9, padding:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:6 }}>
              <span style={{ color:C.muted }}>Arancel base (RD 1426/1989)</span>
              <span style={{ fontWeight:700 }}>{arBase.toLocaleString('es-ES',{style:"currency",currency:"EUR"})}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:6 }}>
              <span style={{ color:C.muted }}>IVA (21%)</span>
              <span style={{ fontWeight:700 }}>{(arBase * 0.21).toLocaleString('es-ES',{style:"currency",currency:"EUR"})}</span>
            </div>
            <div style={{ height:1, background:C.border, margin:"8px 0" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:14 }}>
              <span style={{ fontWeight:700 }}>Total con IVA</span>
              <span style={{ fontWeight:800, color:C.primary }}>{arTotal.toLocaleString('es-ES',{style:"currency",currency:"EUR"})}</span>
            </div>
          </div>
          <div style={{ marginTop:10, fontSize:11, color:C.muted, lineHeight:1.5 }}>Estimación orientativa según RD 1426/1989. El arancel definitivo lo fija el notario.</div>
        </Card>
      )}

      {/* MODELO 600 */}
      {tab === "modelo600" && (
        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
          {/* Form */}
          <div style={{ flex:2, minWidth:300 }}>
            <Card style={{ padding:18 }}>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:14, fontWeight:700 }}>Autoliquidación Modelo 600</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Agència Tributària de Catalunya · DL 5/2025</div>
              </div>

              {/* Modalidad */}
              <div style={ss}>
                <span style={lbl}>1 — Modalidad</span>
                <div style={{ display:"flex", gap:6 }}>
                  {[["tpo","TPO"],["ajd","AJD"],["os","OS"]].map(([k,l]) => (
                    <div key={k} onClick={() => setModalidad(k as "tpo"|"ajd"|"os")}
                      style={{ flex:1, padding:"8px 5px", borderRadius:7, border:`2px solid ${modalidad===k?C.primary:C.border}`, background:modalidad===k?C.blueBg2:"#fff", cursor:"pointer", textAlign:"center", fontSize:12.5, fontWeight:600, color:modalidad===k?C.primary:C.muted }}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* AJD type */}
              {modalidad === "ajd" && (
                <div style={ss}>
                  <label style={lbl}>Tipo AJD</label>
                  <select value={tipoAJD} onChange={e => setTipoAJD(e.target.value)} style={inp}>
                    {TIPOS_AJD.map(t => <option key={t.value} value={t.value}>{t.label} — {t.pct}%</option>)}
                  </select>
                </div>
              )}

              {/* TPO profile */}
              {modalidad === "tpo" && (
                <div style={ss}>
                  <label style={lbl}>Perfil adquirente</label>
                  <select value={perfil} onChange={e => setPerfil(e.target.value)} style={inp}>
                    {PERFILES_ITP.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              )}

              {/* OS info */}
              {modalidad === "os" && (
                <div style={{ ...ss, background:C.greenBg }}>
                  <div style={{ fontSize:12.5, color:"#065f46" }}>✓ OS exenta desde 2010. Cuota: 0 €. Presentar igualmente en plazo.</div>
                </div>
              )}

              {/* Escritura */}
              <div style={ss}>
                <span style={lbl}>2 — Escritura</span>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                  <div>
                    <label style={{ ...lbl, marginBottom:4 }}>Fecha devengo</label>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp}/>
                  </div>
                  <div>
                    <label style={{ ...lbl, marginBottom:4 }}>Nº protocolo</label>
                    <input value={protocolo} onChange={e => setProtocolo(e.target.value)} placeholder="1234/2026" style={inp}/>
                  </div>
                </div>
              </div>

              {/* Sujeto pasivo */}
              <div style={ss}>
                <span style={lbl}>3 — Sujeto pasivo</span>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                  <div>
                    <label style={{ ...lbl, marginBottom:4 }}>Nombre</label>
                    <input value={nombreSP} onChange={e => setNombreSP(e.target.value)} placeholder="Nombre completo" style={inp}/>
                  </div>
                  <div>
                    <label style={{ ...lbl, marginBottom:4 }}>NIF/NIE/CIF</label>
                    <input value={nifSP} onChange={e => setNifSP(e.target.value)} placeholder="12345678A" style={inp}/>
                  </div>
                </div>
              </div>

              {/* Bien */}
              <div style={ss}>
                <span style={lbl}>4 — Bien</span>
                <textarea value={descBien} onChange={e => setDescBien(e.target.value)} rows={2}
                  placeholder="Ej. Piso en Passeig de Gràcia 45, 4º 2ª, Barcelona"
                  style={{ ...inp, resize:"vertical", fontFamily:"inherit" }}/>
              </div>

              {/* Base imponible */}
              <div style={ss}>
                <label style={lbl}>5 — Base imponible</label>
                <label style={{ ...lbl, marginBottom:4, fontWeight:500, textTransform:"none", letterSpacing:0, fontSize:12 }}>
                  {modalidad==="ajd" && tipoAJD==="ajd_hipoteca" ? "Responsabilidad hipotecaria (€)" : "Valor declarado (€)"}
                </label>
                <input type="number" value={m6Valor} onChange={e => setM6Valor(e.target.value)} placeholder="Ej. 285000" style={inp}/>
              </div>
            </Card>
          </div>

          {/* Result panel */}
          <div style={{ flex:1, minWidth:240, display:"flex", flexDirection:"column", gap:12 }}>
            <Card style={{ padding:16 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>Liquidación</div>
              {resultado600 && (v600 > 0 || modalidad === "os") ? (
                <>
                  {resultado600.tramos && resultado600.tramos.length > 0 && resultado600.tramos.map((t,i) => (
                    <div key={i} style={{ padding:"6px 0", borderBottom:`1px solid ${C.border}`, fontSize:11 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ color:C.muted, flex:1 }}>{t.label}</span>
                        <span style={{ fontWeight:700 }}>{t.cuota.toLocaleString("es-ES",{style:"currency",currency:"EUR"})}</span>
                      </div>
                      <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{t.base.toLocaleString("es-ES")} € × {t.tipo}%</div>
                    </div>
                  ))}
                  <div style={{ background:C.blueBg, borderRadius:8, padding:11, marginTop:8 }}>
                    {[
                      ["Base", v600>0 ? v600.toLocaleString("es-ES",{style:"currency",currency:"EUR"}) : "—"],
                      ["Tipo", resultado600.tipoDesc],
                      ["Tarifa", resultado600.tarifa],
                    ].map(([k,v]) => (
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                        <span style={{ color:C.muted }}>{k}</span>
                        <span style={{ fontWeight:600, color:k==="Tarifa"?C.primary:C.text }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ height:1, background:C.border, margin:"6px 0" }}/>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:14 }}>
                      <span style={{ fontWeight:800 }}>CUOTA</span>
                      <span style={{ fontWeight:800, color:resultado600.cuota===0?C.green:C.primary }}>
                        {resultado600.cuota===0 ? "0,00 € EXENTO" : resultado600.cuota.toLocaleString("es-ES",{style:"currency",currency:"EUR"})}
                      </span>
                    </div>
                  </div>
                  {plazo600 && (
                    <div style={{ background:C.amberBg, borderRadius:7, padding:9, marginTop:8, fontSize:11, color:"#92400E" }}>
                      ⏰ Plazo 30 días hábiles: <strong>{plazo600}</strong>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign:"center", padding:"20px 0", color:C.muted, fontSize:12 }}>
                  {modalidad==="os" ? "✓ Exenta · 0 €" : "Introduce la base imponible para calcular"}
                </div>
              )}
            </Card>

            {/* Rate reference */}
            <Card style={{ padding:14 }}>
              <div style={{ fontWeight:700, fontSize:12, marginBottom:8 }}>Tipos vigentes 2026</div>
              <div style={{ fontSize:11, color:C.muted, lineHeight:1.8 }}>
                <div style={{ fontWeight:600, color:C.text, marginBottom:2 }}>TPO (DL 5/2025)</div>
                <div>≤600K → <strong>10%</strong></div>
                <div>600–900K → <strong>11%</strong></div>
                <div>900K–1,5M → <strong>12%</strong></div>
                <div>+1,5M → <strong>13%</strong></div>
                <div>Joven/fam/discap → <strong>5%</strong></div>
                <div>VPO → <strong>7%</strong></div>
                <div>Gran tenedor → <strong>20%</strong></div>
                <div style={{ fontWeight:600, color:C.text, marginTop:6, marginBottom:2 }}>AJD</div>
                <div>Hipoteca → <strong>2%</strong> · General → <strong>1,5%</strong></div>
                <div style={{ fontWeight:600, color:C.text, marginTop:4 }}>OS → <strong>0% exento</strong></div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
