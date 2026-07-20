import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { minuta, expediente, notaria } = await req.json()
  if (!minuta) return NextResponse.json({ error: 'Missing minuta' }, { status: 400 })

  const now = new Date()
  const fechaStr = now.toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })
  const horaStr  = now.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })

  try {
    const templatePath = join(process.cwd(), 'public', 'templates', 'minuta_template.docx')
    const content = readFileSync(templatePath, 'binary')
    const zip  = new PizZip(content)
    const doc  = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

    doc.render({
      MINUTA_TEXTO:    minuta,
      EXPEDIENTE_ID:   expediente?.id ?? '—',
      CLIENTE:         expediente?.cliente ?? '—',
      TIPO_ACTO:       expediente?.tipo ?? '—',
      VALOR:           expediente?.valor ? `${Number(expediente.valor).toLocaleString('es-ES')} €` : '—',
      NOTARIA_NOMBRE:  notaria?.nombre ?? 'Notaría',
      NOTARIA_CIF:     notaria?.cif ?? '',
      NOTARIA_DIR:     notaria?.direccion ?? '',
      FECHA_EMISION:   fechaStr,
      HORA_EMISION:    horaStr,
      AVISO_LEGAL:     'BORRADOR ORIENTATIVO — Documento generado por IA. Debe ser revisado, completado y autorizado por el notario titular antes de elevarlo a escritura pública. NotarioFlow no asume responsabilidad jurídica sobre el contenido.',
    })

    const buf = doc.getZip().generate({ type: 'arraybuffer', compression: 'DEFLATE' }) as ArrayBuffer

    return new Response(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="minuta_${expediente?.id ?? 'borrador'}_${now.toISOString().slice(0,10)}.docx"`,
      },
    })
  } catch (e) {
    console.error('Docx export error:', e)
    return NextResponse.json({ error: 'Failed to generate docx' }, { status: 500 })
  }
}
