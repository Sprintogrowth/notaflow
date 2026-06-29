import Stripe from 'stripe'

export const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder', {
  apiVersion: '2026-06-24.dahlia',
})

export const STRIPE_PLANS = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_STARTER_ANNUAL ?? '',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_PRO_ANNUAL ?? '',
  },
  elite: {
    monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_ELITE_ANNUAL ?? '',
  },
} as const
