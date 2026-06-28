import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const DEFAULT_SYSTEM = `Eres el asistente virtual de la Notaría Barceló i Associats en Barcelona. Atiendes consultas de clientes de forma profesional y cercana. Nunca das consejo jurídico. Tu objetivo: entender qué necesita, informar del proceso general, pedir los documentos básicos, ofrecer cita. Tutea. Máximo 2-3 frases. Español.`

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, system, maxTokens } = await req.json()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens ?? 300,
      messages: [
        { role: 'system', content: system ?? DEFAULT_SYSTEM },
        ...messages,
      ],
    })
    const text = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ content: text, text })
  } catch (e) {
    console.error('OpenAI API error:', e)
    return NextResponse.json({ content: 'Un momento, te pongo con un oficial de la notaría.', text: 'Un momento, te pongo con un oficial de la notaría.' })
  }
}
