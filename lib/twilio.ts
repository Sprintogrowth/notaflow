import twilio from 'twilio'

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export const TWILIO_WHATSAPP_FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`

export async function sendWhatsApp(to: string, body: string) {
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  return twilioClient.messages.create({
    from: TWILIO_WHATSAPP_FROM,
    to: toFormatted,
    body,
  })
}
