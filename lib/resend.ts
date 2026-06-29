import { Resend } from 'resend'

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

export const FROM_EMAIL = 'NotaFlow <noreply@notaflow.es>'

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  return getResend().emails.send({ from: FROM_EMAIL, to, subject, html })
}
