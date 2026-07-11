import { Resend } from "resend"

import { env } from "@/lib/env"

type SendEmailInput = {
  html: string
  subject: string
  text: string
  to: string[]
}

type SendEmailResult =
  | { status: "sent" }
  | { reason: string; status: "skipped" }
  | { error: unknown; status: "failed" }

let resendClient: Resend | null = null

function getResendClient() {
  if (!env.RESEND_API_KEY) {
    return null
  }

  resendClient ??= new Resend(env.RESEND_API_KEY)

  return resendClient
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function getDeliveryFields(input: SendEmailInput, recipients: string[]) {
  if (!env.EMAIL_TEST_RECIPIENT) {
    return {
      html: input.html,
      subject: input.subject,
      text: input.text,
      to: recipients,
    }
  }

  const originalRecipients = recipients.join(", ")
  const testNotice = `Email de prueba redirigido. Destinatario original: ${originalRecipients}`

  return {
    html: `
      <div style="margin-bottom:16px;border:1px solid #f2c66d;background:#fff8eb;color:#1e1b16;padding:12px;border-radius:12px;font-family:Arial,sans-serif;font-size:14px;">
        <strong>Email de prueba redirigido.</strong><br />
        Destinatario original: ${escapeHtml(originalRecipients)}
      </div>
      ${input.html}
    `,
    subject: `[TEST para ${originalRecipients}] ${input.subject}`,
    text: `${testNotice}\n\n${input.text}`,
    to: [env.EMAIL_TEST_RECIPIENT],
  }
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resend = getResendClient()
  const recipients = Array.from(new Set(input.to.map((email) => email.trim()).filter(Boolean)))

  if (!resend) {
    console.warn("Email no enviado: falta RESEND_API_KEY.")
    return { reason: "missing-api-key", status: "skipped" }
  }

  if (!env.EMAIL_FROM) {
    console.warn("Email no enviado: falta EMAIL_FROM.")
    return { reason: "missing-from", status: "skipped" }
  }

  if (recipients.length === 0) {
    return { reason: "missing-recipient", status: "skipped" }
  }

  const delivery = getDeliveryFields(input, recipients)

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    html: delivery.html,
    subject: delivery.subject,
    text: delivery.text,
    to: delivery.to,
  })

  if (error) {
    console.error("No se pudo enviar el email.", error)
    return { error, status: "failed" }
  }

  return { status: "sent" }
}
