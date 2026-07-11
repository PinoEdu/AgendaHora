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

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    html: input.html,
    subject: input.subject,
    text: input.text,
    to: recipients,
  })

  if (error) {
    console.error("No se pudo enviar el email.", error)
    return { error, status: "failed" }
  }

  return { status: "sent" }
}
