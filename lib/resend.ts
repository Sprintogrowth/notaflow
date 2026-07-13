export const FROM_EMAIL = 'NotaFlow <noreply@notaflow.es>'

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY ?? '',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'NotaFlow', email: 'noreply@notaflow.es' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Brevo error: ${err}`)
  }
  return res.json()
}
