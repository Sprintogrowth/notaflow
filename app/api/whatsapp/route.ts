import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import twilio from 'twilio'
import OpenAI from 'openai'

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? 'placeholder' })

const SYSTEM = `Eres el asistente virtual de una notaría española. Atiendes por WhatsApp de forma profesional y cercana. Nunca das consejo jurídico. Tu objetivo: entender qué necesita el cliente, informar del proceso general, pedir los documentos básicos si aplica, y ofrecer cita. Tutea. Responde en máximo 3 frases. Español.`

export async function POST(req: Request) {
  // Validate Twilio signature
  const twilioSig = req.headers.get('x-twilio-signature') ?? ''
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp`
  const body = await req.text()
  const params = Object.fromEntries(new URLSearchParams(body))

  const valid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    twilioSig,
    url,
    params
  )
  if (!valid && process.env.NODE_ENV === 'production') {
    return new Response('Forbidden', { status: 403 })
  }

  const from    = params.From ?? ''   // e.g. whatsapp:+34612345678
  const msgBody = params.Body ?? ''
  const notariaPhone = params.To ?? ''

  // Find notaría by WhatsApp number
  const supabase = await createClient()
  const { data: notaria } = await supabase
    .from('notarias')
    .select('id, nombre')
    .eq('whatsapp_number', notariaPhone.replace('whatsapp:', ''))
    .single()

  const notariaNombre = notaria?.nombre ?? 'la notaría'

  // Generate AI reply
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 200,
    messages: [
      { role: 'system', content: `${SYSTEM} Trabajas para ${notariaNombre}.` },
      { role: 'user', content: msgBody },
    ],
  })
  const reply = completion.choices[0]?.message?.content ?? 'En breve te atendemos.'

  // Save lead if first contact
  if (notaria?.id) {
    const phone = from.replace('whatsapp:', '')
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('telefono', phone)
      .eq('notaria_id', notaria.id)
      .single()

    if (!existing) {
      await supabase.from('leads').insert({
        nombre: `WhatsApp ${phone}`,
        telefono: phone,
        canal: 'whatsapp',
        tipo: 'Consulta WhatsApp',
        estado: 'nuevo',
        notaria_id: notaria.id,
      })
    }
  }

  // Reply via TwiML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${reply}</Message>
</Response>`

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  })
}
