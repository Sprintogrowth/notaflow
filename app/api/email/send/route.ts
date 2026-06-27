import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { leadWelcomeEmail, citaReminderEmail, expedienteUpdateEmail } from '@/lib/email/templates'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, data } = await req.json()

  let html = ''
  let subject = ''

  switch (type) {
    case 'lead_welcome':
      html    = leadWelcomeEmail(data)
      subject = `Hemos recibido tu consulta — ${data.notaria}`
      break
    case 'cita_reminder':
      html    = citaReminderEmail(data)
      subject = `Recordatorio: tu cita mañana a las ${data.hora} — ${data.notaria}`
      break
    case 'expediente_update':
      html    = expedienteUpdateEmail(data)
      subject = `Actualización de tu expediente ${data.expedienteId} — ${data.notaria}`
      break
    default:
      return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
  }

  try {
    await sendEmail({ to: data.email, subject, html })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Email send error:', e)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
