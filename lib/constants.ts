export const C = {
  // Blues
  blue900:"#0F2D6B", blue700:"#1B4FD8", blue500:"#3B6EF8",
  blue100:"#DBEAFE", blue50:"#EFF6FF",
  // Neutrals
  white:"#FFFFFF", gray50:"#F8FAFC", gray100:"#F1F5F9",
  gray200:"#E2E8F0", gray300:"#CBD5E1", gray400:"#94A3B8",
  gray500:"#64748B", gray700:"#334155", gray900:"#0F172A",
  // Status
  green600:"#059669", green100:"#D1FAE5",
  amber600:"#D97706", amber100:"#FEF3C7",
  red600:"#DC2626",   red100:"#FEE2E2",
  purple600:"#7C3AED",purple100:"#EDE9FE",
  // Aliases used in v4 components
  primary:"#1B4FD8", muted:"#64748B", text:"#0F172A",
  border:"#E2E8F0",  bg:"#F8FAFC",    bg2:"#F1F5F9",
  dark:"#0F172A",
  green:"#059669",  greenBg:"#D1FAE5",
  amber:"#D97706",  amberBg:"#FEF3C7",
  red:"#DC2626",    redBg:"#FEE2E2",
  purple:"#7C3AED", purpleBg:"#EDE9FE",
  blueBg:"#EFF6FF", blueBg2:"#DBEAFE",
}

export const PLANES = {
  starter: { id:"starter", nombre:"Notaría Digital", precio:197, precioAnual:163, color:"#1B4FD8", popular:false,
    descripcion:"Para notarías que empiezan su transformación digital.", soporte:"Email 72h",
    features:[
      {ok:true,  text:"Hasta 3 usuarios"},
      {ok:true,  text:"CRM de leads"},
      {ok:true,  text:"Expedientes (hasta 100/mes)"},
      {ok:true,  text:"Agenda básica"},
      {ok:true,  text:"Calculadora aranceles"},
      {ok:false, text:"NotaBot IA 24/7"},
      {ok:false, text:"Minutas con IA"},
      {ok:false, text:"Modelo 600 ITP/AJD"},
      {ok:false, text:"WhatsApp Business"},
    ]
  },
  pro: { id:"pro", nombre:"Notaría Pro", precio:397, precioAnual:330, color:"#7C3AED", popular:true,
    descripcion:"El más completo para notarías con equipo y volumen.", soporte:"Chat 24h + Onboarding",
    features:[
      {ok:true, text:"Usuarios ilimitados"},
      {ok:true, text:"CRM de leads + multicanal"},
      {ok:true, text:"Expedientes ilimitados"},
      {ok:true, text:"NotaBot IA 24/7"},
      {ok:true, text:"Minutas con IA"},
      {ok:true, text:"Modelo 600 ITP/AJD"},
      {ok:true, text:"WhatsApp Business"},
      {ok:true, text:"Agenda inteligente"},
      {ok:false,text:"Llamadas voz IA (Retell)"},
    ]
  },
  elite: { id:"elite", nombre:"Notaría Elite", precio:597, precioAnual:497, color:"#D97706", popular:false,
    descripcion:"Para notarías con alto volumen y máxima automatización.", soporte:"WhatsApp directo + voz",
    features:[
      {ok:true, text:"Todo de Pro"},
      {ok:true, text:"Llamadas voz IA (Retell)"},
      {ok:true, text:"API pública"},
      {ok:true, text:"Soporte prioritario WhatsApp"},
      {ok:true, text:"Onboarding personalizado"},
      {ok:true, text:"SLA 99.9%"},
      {ok:true, text:"Firma digital (Signaturit)"},
      {ok:true, text:"Export Registro Propiedad"},
    ]
  },
}

export const TIPO_ACTO = [
  "Compraventa","Testamento","Poder Notarial","Herencia",
  "Constitución SL","Donación","Hipoteca","Acta Notarial",
]

export const CANALES = ["WhatsApp","Instagram","Web","Google Maps","Teléfono"]

export const DOCS_POR_TIPO: Record<string, string[]> = {
  "Compraventa":[
    "DNI/NIE comprador","DNI/NIE vendedor","Nota simple Registro Propiedad",
    "Certificado IBI último recibo","Últimas 3 facturas suministros",
    "Certificado comunidad al corriente de pago","Tasación bancaria",
    "Cédula de habitabilidad","Certificado eficiencia energética",
  ],
  "Testamento":[
    "DNI/NIE testador","Libro de familia","Certificado empadronamiento",
  ],
  "Poder Notarial":[
    "DNI/NIE poderdante","DNI/NIE apoderado","Nota simple inmueble (si aplica)",
  ],
  "Herencia":[
    "Certificado de defunción","Certificado últimas voluntades",
    "Testamento o declaración herederos","DNI/NIE herederos",
    "Nota simple inmuebles","Certificados bancarios","Inventario bienes",
  ],
  "Constitución SL":[
    "DNI/NIE socios fundadores","Certificado negativo de nombre (Registro Mercantil)",
    "Estatutos sociales borrador","Certificado depósito capital social",
    "Domicilio social acreditado",
  ],
  "Donación":[
    "DNI/NIE donante","DNI/NIE donatario","Nota simple bien donado",
    "Valoración bien (si inmueble)","Certificado IBI (si inmueble)",
  ],
  "Hipoteca":[
    "DNI/NIE solicitante","Nota simple inmueble",
    "Oferta vinculante banco","FEIN y FIAE",
    "Tasación bancaria","Seguro vida (si requerido)",
  ],
  "Acta Notarial":[
    "DNI/NIE solicitante","Documentación objeto del acta",
  ],
}

export const PERFILES_ITP = [
  { value:"general",       label:"General" },
  { value:"joven",         label:"Joven (≤35 años, 1ª vivienda habitual)" },
  { value:"familia",       label:"Familia numerosa" },
  { value:"discapacidad",  label:"Discapacidad ≥33%" },
  { value:"vpo",           label:"VPO / Vivienda protección oficial" },
  { value:"gran_tenedor",  label:"Gran tenedor (>10 inmuebles)" },
]

export const TIPOS_AJD = [
  { value:"ajd_hipoteca",  label:"Hipoteca",                  pct:2.0,  tarifa:"AJD Hipoteca" },
  { value:"ajd_general",   label:"Documento notarial general", pct:1.5,  tarifa:"AJD General" },
  { value:"ajd_credito",   label:"Crédito con garantía",      pct:1.5,  tarifa:"AJD Crédito" },
  { value:"ajd_arrendamiento", label:"Arrendamiento",         pct:0.5,  tarifa:"AJD Arrendamiento" },
]

// ITP progressive rates Cataluña (DL 5/2025)
export function calcularITP_Cat(valor: number, perfil: string): {
  cuota: number; tipoDesc: string; tarifa: string;
  tramos: { label: string; base: number; tipo: number; cuota: number }[]
} {
  if (perfil === "gran_tenedor") {
    return { cuota: valor * 0.20, tipoDesc: "20% — Gran tenedor", tarifa:"TPO Gran tenedor", tramos:[{label:"Gran tenedor",base:valor,tipo:20,cuota:valor*0.20}] }
  }
  if (perfil === "joven" || perfil === "familia" || perfil === "discapacidad") {
    return { cuota: valor * 0.05, tipoDesc: "5% — Perfil reducido", tarifa:"TPO Reducido", tramos:[{label:"Tipo reducido",base:valor,tipo:5,cuota:valor*0.05}] }
  }
  if (perfil === "vpo") {
    return { cuota: valor * 0.07, tipoDesc: "7% — VPO", tarifa:"TPO VPO", tramos:[{label:"VPO",base:valor,tipo:7,cuota:valor*0.07}] }
  }
  // Progressive general rates
  const tramos = []
  let restante = valor, cuotaTotal = 0
  const escalas = [
    { limite: 600_000,   tipo: 10, label: "Hasta 600.000 €" },
    { limite: 300_000,   tipo: 11, label: "600.001 – 900.000 €" },
    { limite: 600_000,   tipo: 12, label: "900.001 – 1.500.000 €" },
    { limite: Infinity,  tipo: 13, label: "Más de 1.500.000 €" },
  ]
  for (const e of escalas) {
    if (restante <= 0) break
    const base = e.limite === Infinity ? restante : Math.min(restante, e.limite)
    const cuota = base * e.tipo / 100
    tramos.push({ label: e.label, base, tipo: e.tipo, cuota })
    cuotaTotal += cuota
    restante -= base
  }
  const tipoEfectivo = ((cuotaTotal / valor) * 100).toFixed(2)
  return { cuota: cuotaTotal, tipoDesc: `${tipoEfectivo}% efectivo (escala progresiva)`, tarifa:"TPO General", tramos }
}

// Calculate working-day deadline (excludes weekends; Catalunya public holidays simplified)
export function calcularPlazoHabil(fechaStr: string, dias: number): string | null {
  if (!fechaStr) return null
  const d = new Date(fechaStr)
  if (isNaN(d.getTime())) return null
  let added = 0
  while (added < dias) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return d.toLocaleDateString("es-ES", { day:"numeric", month:"long", year:"numeric" })
}

// Arancel notarial estimado (RD 1426/1989, simplified)
export function calcularArancel(valor: number): number {
  if (valor <= 0) return 0
  if (valor <= 6_010.12)  return 90.15
  if (valor <= 30_050.61) return 90.15 + (valor - 6_010.12) * 0.0045
  if (valor <= 60_101.21) return 90.15 + 108.18 + (valor - 30_050.61) * 0.00175
  if (valor <= 150_253.03) return 90.15 + 108.18 + 52.59 + (valor - 60_101.21) * 0.00125
  if (valor <= 601_012.10) return 90.15 + 108.18 + 52.59 + 112.70 + (valor - 150_253.03) * 0.0007
  return 90.15 + 108.18 + 52.59 + 112.70 + 315.71 + (valor - 601_012.10) * 0.0003
}

export const ROL_LABEL: Record<string, string> = {
  notario_titular: "Notario titular",
  oficial:         "Oficial",
  auxiliar:        "Auxiliar",
  solo_lectura:    "Solo lectura",
  super_admin:     "Super Admin",
}

export const ROL_COLOR: Record<string, { color: string; bg: string }> = {
  notario_titular: { color:"#D97706", bg:"#FEF3C7" },
  oficial:         { color:"#1B4FD8", bg:"#DBEAFE" },
  auxiliar:        { color:"#059669", bg:"#D1FAE5" },
  solo_lectura:    { color:"#64748B", bg:"#F1F5F9" },
  super_admin:     { color:"#7C3AED", bg:"#EDE9FE" },
}

export const ROL_PERMISOS = {
  notario_titular: { puedeEditar:true, verFacturacion:true, verAdmin:true, verTodosExpedientes:true, verTodo:false },
  oficial:         { puedeEditar:true, verFacturacion:false, verAdmin:false, verTodosExpedientes:false, verTodo:false },
  auxiliar:        { puedeEditar:false, verFacturacion:false, verAdmin:false, verTodosExpedientes:false, verTodo:false },
  solo_lectura:    { puedeEditar:false, verFacturacion:false, verAdmin:false, verTodosExpedientes:true, verTodo:false },
  super_admin:     { puedeEditar:true, verFacturacion:true, verAdmin:true, verTodosExpedientes:true, verTodo:true },
}

export function permisos(rol: string) {
  return ROL_PERMISOS[rol as keyof typeof ROL_PERMISOS] ?? ROL_PERMISOS.solo_lectura
}

export const estadoLead = {
  nuevo:         { label:"Nuevo",         c:C.blue700,   bg:C.blue50    },
  contactado:    { label:"Contactado",    c:C.amber600,  bg:C.amber100  },
  cita_agendada: { label:"Cita agendada", c:C.green600,  bg:C.green100  },
}

export const estadoExp = {
  documentacion:    { label:"Documentación",    c:C.amber600,  bg:C.amber100,  col:"#F59E0B"   },
  revision:         { label:"Revisión notario", c:C.blue700,   bg:C.blue100,   col:C.blue700   },
  pendiente_firma:  { label:"Pendiente firma",  c:C.purple600, bg:C.purple100, col:C.purple600 },
  tramitacion:      { label:"En tramitación",   c:C.green600,  bg:C.green100,  col:C.green600  },
  cerrado:          { label:"Cerrado",          c:C.gray500,   bg:C.gray100,   col:C.gray400   },
}

export const CANAL_LABEL: Record<string, string> = {
  whatsapp:"WhatsApp", instagram:"Instagram", web:"Web",
  google:"Google Maps", telefono:"Teléfono",
}

export const PLAN_COLOR = {
  starter: { color:"#1B4FD8", bg:"#DBEAFE", label:"Notaría Digital" },
  pro:     { color:"#7C3AED", bg:"#EDE9FE", label:"Notaría Pro" },
  elite:   { color:"#D97706", bg:"#FEF3C7", label:"Notaría Elite" },
}

export const fEur = (v: number | null) =>
  v != null ? v.toLocaleString("es-ES", { style:"currency", currency:"EUR" }) : "—"

export const ini = (n: string) =>
  (n || "U").split(" ").filter(Boolean).slice(0,2).map(w => w[0]).join("").toUpperCase()
