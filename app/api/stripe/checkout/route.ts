import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, billing, notaria_id } = await req.json()
  if (!plan || !billing || !notaria_id) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const priceId = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]?.[billing as 'monthly' | 'annual']
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe=success`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/register?stripe=cancelled`,
    metadata: { notaria_id, plan, user_id: user.id },
    subscription_data: {
      metadata: { notaria_id, plan },
      trial_period_days: 14,
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    locale: 'es',
  })

  return NextResponse.json({ url: session.url })
}
