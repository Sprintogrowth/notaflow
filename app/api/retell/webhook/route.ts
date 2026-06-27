import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { emailBase } from '@/lib/email/templates'

export async function POST(req: Request) {
  // Validate Retell webhook secret
  const apiKey = req.headers.get('x-retell-signature') ?? req.headers.get('authorization') ?? ''
  if (process.env.NODE_ENV === 'production' && apiKey !== process.env.RETELL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { event, call } = body

  const supabase = await createClient()

  switch (event) {
    case 'call_ended': {
      const leadId  = call?.retell_llm_dynamic_variables?.lead_id
      const summary = call?.call_analysis?.call_summary ?? 'Sin resumen disponible.'
      const sentiment = call?.call_analysis?.user_sentiment ?? 'Neutral'
      const duration = call?.duration_ms ? Math.round(call.duration_ms / 1000) : 0

      if (leadId) {
        await supabase.from('leads').update({
          notas: `Llamada IA · ${duration}s · Sentimiento: ${sentiment}\n\nResumen: ${summary}`,
          estado: 'contactado',
        }).eq('id', leadId)
      }

      // Email summary to notaría team
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, notarias(email, nombre)')
        .eq('role', 'notario_titular')
        .single()

      const notariaEmail = (profile?.notarias as { email: string; nombre: string } | null)?.email
      const notariaNombre = (profile?.notarias as { email: string; nombre: string } | null)?.nombre ?? 'la notaría'

      if (notariaEmail) {
        await sendEmail({
          to: notariaEmail,
          subject: `Resumen de llamada IA — ${new Date().toLocaleString('es-ES')}`,
          html: emailBase(`
            <h2>Resumen de llamada IA 📞</h2>
            <p>Se ha completado una llamada automática de NotaFlow para <strong>${notariaNombre}</strong>.</p>
            <div class="info-box">
              <div class="info-row"><span class="label">Duración</span><span class="value">${duration}s</span></div>
              <div class="info-row"><span class="label">Sentimiento</span><span class="value">${sentiment}</span></div>
            </div>
            <p><strong>Resumen:</strong><br>${summary}</p>
          `),
        })
      }
      break
    }

    case 'call_analyzed': {
      // Additional analysis data available — could log to DB
      break
    }
  }

  return NextResponse.json({ received: true })
}
