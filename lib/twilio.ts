import twilio from 'twilio'

const getTwilio = () => twilio(
  process.env.TWILIO_ACCOUNT_SID ?? 'placeholder',
  process.env.TWILIO_AUTH_TOKEN ?? 'placeholder'
)

export const TWILIO_WHATSAPP_FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`

export async function sendWhatsApp(to: string, body: string) {
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  return getTwilio().messages.create({
    from: TWILIO_WHATSAPP_FROM,
    to: toFormatted,
    body,
  })
}
