export function emailBase(content: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f1f5f9; }
  .wrap { max-width:560px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08); }
  .header { background:#0f172a; padding:24px 32px; }
  .logo { color:#fff; font-size:20px; font-weight:800; letter-spacing:-0.5px; }
  .logo span { color:#3b82f6; }
  .body { padding:28px 32px; }
  .footer { padding:16px 32px; background:#f8fafc; border-top:1px solid #e2e8f0; font-size:12px; color:#94a3b8; }
  h2 { margin:0 0 12px; font-size:20px; color:#0f172a; }
  p { margin:0 0 14px; font-size:14px; color:#475569; line-height:1.65; }
  .btn { display:inline-block; padding:11px 24px; background:#1e40af; color:#fff; text-decoration:none; border-radius:8px; font-weight:700; font-size:14px; margin:8px 0 16px; }
  .info-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 18px; margin:14px 0; }
  .info-row { display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #e2e8f0; font-size:13px; }
  .info-row:last-child { border-bottom:none; }
  .label { color:#94a3b8; }
  .value { font-weight:600; color:#0f172a; }
  .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
  .badge-blue { background:#dbeafe; color:#1e40af; }
  .badge-green { background:#dcfce7; color:#166534; }
  .badge-amber { background:#fef9c3; color:#92400e; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo">⚖️ Nota<span>Flow</span></div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      NotarioFlow · Sistema de gestión notarial · <a href="https://NotarioFlow.es" style="color:#3b82f6">NotarioFlow.es</a><br>
      Este email es automático. No respondas a este mensaje.
    </div>
  </div>
</body>
</html>`
}

export function leadWelcomeEmail({ nombre, notaria, tipo }: { nombre: string; notaria: string; tipo: string }) {
  return emailBase(`
    <h2>Hemos recibido tu consulta 👋</h2>
    <p>Hola <strong>${nombre}</strong>, gracias por contactar con <strong>${notaria}</strong>.</p>
    <div class="info-box">
      <div class="info-row"><span class="label">Consulta</span><span class="value">${tipo}</span></div>
      <div class="info-row"><span class="label">Estado</span><span class="badge badge-blue">En revisión</span></div>
    </div>
    <p>Un miembro de nuestro equipo revisará tu solicitud y te contactará en las próximas <strong>24 horas</strong>.</p>
    <p>Si tienes cualquier pregunta urgente, puedes contactarnos directamente por WhatsApp o teléfono.</p>
  `)
}

export function citaReminderEmail({ nombre, fecha, hora, tipo, sala, notaria }: {
  nombre: string; fecha: string; hora: string; tipo: string; sala: string; notaria: string
}) {
  return emailBase(`
    <h2>Recordatorio de cita 📅</h2>
    <p>Hola <strong>${nombre}</strong>, te recordamos que mañana tienes una cita en <strong>${notaria}</strong>.</p>
    <div class="info-box">
      <div class="info-row"><span class="label">Fecha</span><span class="value">${fecha}</span></div>
      <div class="info-row"><span class="label">Hora</span><span class="value">${hora}</span></div>
      <div class="info-row"><span class="label">Tipo</span><span class="value">${tipo}</span></div>
      <div class="info-row"><span class="label">Sala</span><span class="value">${sala}</span></div>
    </div>
    <p><strong>Recuerda traer:</strong> DNI o NIE original y los documentos relacionados con el acto notarial.</p>
    <p>Si necesitas cancelar o cambiar la cita, contáctanos con la mayor antelación posible.</p>
  `)
}

export function expedienteUpdateEmail({ nombre, expedienteId, tipo, estado, notaria }: {
  nombre: string; expedienteId: string; tipo: string; estado: string; notaria: string
}) {
  return emailBase(`
    <h2>Actualización de expediente 💼</h2>
    <p>Hola <strong>${nombre}</strong>, hay una actualización en tu expediente en <strong>${notaria}</strong>.</p>
    <div class="info-box">
      <div class="info-row"><span class="label">Expediente</span><span class="value">${expedienteId}</span></div>
      <div class="info-row"><span class="label">Tipo de acto</span><span class="value">${tipo}</span></div>
      <div class="info-row"><span class="label">Estado</span><span class="badge badge-green">${estado}</span></div>
    </div>
    <p>Si tienes alguna pregunta sobre el estado de tu expediente, no dudes en contactarnos.</p>
  `)
}

export function whatsappCitaReminder({ nombre, fecha, hora, tipo, notaria }: {
  nombre: string; fecha: string; hora: string; tipo: string; notaria: string
}) {
  return `⚖️ *NotarioFlow — Recordatorio de cita*

Hola *${nombre}*, te recordamos que mañana tienes una cita:

📅 *Fecha:* ${fecha}
🕐 *Hora:* ${hora}
📋 *Tipo:* ${tipo}
🏛️ *Notaría:* ${notaria}

Recuerda traer tu DNI/NIE original y los documentos del acto.

Si necesitas cancelar, responde este mensaje o llámanos.`
}
