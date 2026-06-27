import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { notaria_id, plan } = session.metadata ?? {}
      if (!notaria_id) break

      await supabase.from('notarias').update({
        plan,
        estado: 'activa',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
      }).eq('id', notaria_id)

      await supabase.from('subscriptions').upsert({
        notaria_id,
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
        plan,
        estado: 'trialing',
        trial_end: null,
      }, { onConflict: 'notaria_id' })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const notaria_id = sub.metadata?.notaria_id
      if (!notaria_id) break

      const plan = sub.metadata?.plan ?? 'starter'
      const estado = sub.status === 'active' ? 'activa'
        : sub.status === 'trialing' ? 'activa'
        : sub.status === 'past_due' ? 'activa'
        : 'inactiva'

      await supabase.from('notarias').update({ plan, estado }).eq('id', notaria_id)
      await supabase.from('subscriptions').update({
        plan,
        estado: sub.status,
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      }).eq('notaria_id', notaria_id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const notaria_id = sub.metadata?.notaria_id
      if (!notaria_id) break

      await supabase.from('notarias').update({ estado: 'inactiva' }).eq('id', notaria_id)
      await supabase.from('subscriptions').update({ estado: 'canceled' }).eq('notaria_id', notaria_id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : null
      if (customerId) {
        await supabase.from('notarias').update({ estado: 'pago_fallido' } as never).eq('stripe_customer_id', customerId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
