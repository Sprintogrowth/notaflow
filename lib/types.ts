export type UserRole = 'notario_titular' | 'oficial' | 'auxiliar' | 'solo_lectura' | 'super_admin'

export interface Notaria {
  id: string
  nombre: string
  cif: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  web: string | null
  plan: 'starter' | 'pro' | 'elite'
  created_at: string
}

export interface Profile {
  id: string
  nombre: string
  role: UserRole
  notaria_id: string | null
  created_at: string
}

export interface Lead {
  id: number
  notaria_id: string
  nombre: string
  tipo: string
  canal: string
  estado: 'nuevo' | 'contactado' | 'cita_agendada'
  tel: string | null
  email: string | null
  msg: string | null
  urgencia: 'alta' | 'media' | 'baja'
  oficial_id: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Expediente {
  id: string
  notaria_id: string
  cliente: string
  tipo: string
  valor: number | null
  estado: 'documentacion' | 'revision' | 'pendiente_firma' | 'tramitacion' | 'cerrado'
  oficial_id: string | null
  oficial_nombre: string | null
  fecha_apertura: string
  notas: string | null
  urgente: boolean
  itp_listo: boolean
  registro_enviado: boolean
  created_at: string
  updated_at: string
  docs?: ExpedienteDoc[]
}

export interface ExpedienteDoc {
  id: number
  expediente_id: string
  nombre: string
  recibido: boolean
}

export interface Cita {
  id: number
  notaria_id: string
  hora: string
  cliente: string
  tipo: string
  sala: string
  estado: 'pendiente' | 'confirmada'
  tel: string | null
  exp_id: string | null
  fecha: string
  notas: string | null
}

export interface Factura {
  id: string
  notaria_id: string
  expediente_id: string | null
  cliente: string
  tipo: string
  base: number
  total: number
  estado: 'pendiente' | 'cobrada'
  fecha: string
}
