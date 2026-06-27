import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { customer_id } = await req.json()
  if (!customer_id) return NextResponse.json({ error: 'Missing customer_id' }, { status: 400 })

  const session = await stripe.billingPortal.sessions.create({
    customer: customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin`,
  })

  return NextResponse.json({ url: session.url })
}
