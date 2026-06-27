import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { sendWhatsApp } from '@/lib/twilio'
import { citaReminderEmail, whatsappCitaReminder } from '@/lib/email/templates'

// Called daily by Vercel Cron — protected by CRON_SECRET
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Get tomorrow's date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const fechaTomorrow = tomorrow.toISOString().split('T')[0]

  // Fetch all confirmed citas tomorrow with notaría info
  const { data: citas, error } = await supabase
    .from('agenda')
    .select('*, notarias(nombre)')
    .eq('fecha', fechaTomorrow)
    .eq('estado', 'confirmada')

  if (error) {
    console.error('Cron fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let emailsSent = 0
  let whatsappsSent = 0
  const errors: string[] = []

  for (const cita of citas ?? []) {
    const notariaNombre = (cita.notarias as { nombre: string } | null)?.nombre ?? 'la notaría'
    const fechaFormatted = new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    })

    // Send email reminder
    if (cita.email) {
      try {
        await sendEmail({
          to: cita.email,
          subject: `Recordatorio: tu cita mañana a las ${cita.hora.slice(0, 5)} — ${notariaNombre}`,
          html: citaReminderEmail({
            nombre:  cita.cliente,
            fecha:   fechaFormatted,
            hora:    cita.hora.slice(0, 5),
            tipo:    cita.tipo,
            sala:    cita.sala ?? 'Sala principal',
            notaria: notariaNombre,
          }),
        })
        emailsSent++
      } catch (e) {
        errors.push(`Email to ${cita.email}: ${e}`)
      }
    }

    // Send WhatsApp reminder
    if (cita.telefono) {
      try {
        await sendWhatsApp(
          cita.telefono,
          whatsappCitaReminder({
            nombre:  cita.cliente,
            fecha:   fechaFormatted,
            hora:    cita.hora.slice(0, 5),
            tipo:    cita.tipo,
            notaria: notariaNombre,
          })
        )
        whatsappsSent++
      } catch (e) {
        errors.push(`WhatsApp to ${cita.telefono}: ${e}`)
      }
    }
  }

  return NextResponse.json({
    date:          fechaTomorrow,
    citasFound:    citas?.length ?? 0,
    emailsSent,
    whatsappsSent,
    errors,
  })
}
