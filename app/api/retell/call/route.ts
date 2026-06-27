import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to_phone, lead_id, notaria_nombre } = await req.json()
  if (!to_phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 })

  try {
    const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_number:  process.env.RETELL_PHONE_NUMBER,
        to_number:    to_phone,
        agent_id:     process.env.RETELL_AGENT_ID,
        retell_llm_dynamic_variables: {
          notaria_nombre: notaria_nombre ?? 'la notaría',
          lead_id:        lead_id ?? '',
        },
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Retell error')

    // Log the call against the lead
    if (lead_id) {
      await supabase.from('leads').update({
        estado: 'contactado',
        notas: `Llamada IA iniciada · ${new Date().toLocaleString('es-ES')}`,
      }).eq('id', lead_id)
    }

    return NextResponse.json({ call_id: data.call_id, status: 'initiated' })
  } catch (e) {
    console.error('Retell call error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
