import { formatUtcDateTimeInTimezone } from "@/lib/dates"
import { sendEmail } from "@/lib/email"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function buildAppUrl(path: string) {
  if (!env.AUTH_URL) {
    return null
  }

  return `${env.AUTH_URL.replace(/\/$/, "")}${path}`
}

function buildDetailsList(items: Array<[string, string | null | undefined]>) {
  return items
    .filter(([, value]) => value)
    .map(([label, value]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value ?? "")}</li>`)
    .join("")
}

function buildEmailHtml({
  actionHref,
  actionLabel,
  details,
  intro,
  title,
}: {
  actionHref: string | null
  actionLabel: string
  details: Array<[string, string | null | undefined]>
  intro: string
  title: string
}) {
  const escapedActionHref = actionHref ? escapeHtml(actionHref) : null

  return `
    <div style="font-family: Arial, sans-serif; color: #1e1b16; line-height: 1.5;">
      <h1 style="margin: 0 0 12px; font-size: 24px;">${escapeHtml(title)}</h1>
      <p style="margin: 0 0 16px;">${escapeHtml(intro)}</p>
      <ul style="margin: 0 0 20px; padding-left: 20px;">
        ${buildDetailsList(details)}
      </ul>
      ${
        escapedActionHref
          ? `<p style="margin: 0 0 20px;"><a href="${escapedActionHref}" style="display: inline-block; border-radius: 12px; background: #c85a2e; color: #ffffff; padding: 10px 16px; text-decoration: none;">${escapeHtml(actionLabel)}</a></p>`
          : ""
      }
      <p style="margin: 0; color: #655b4f; font-size: 13px;">AgendaHora</p>
    </div>
  `
}

function buildEmailText({
  actionHref,
  actionLabel,
  details,
  intro,
  title,
}: {
  actionHref: string | null
  actionLabel: string
  details: Array<[string, string | null | undefined]>
  intro: string
  title: string
}) {
  const detailLines = details
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n")
  const actionLine = actionHref ? `\n\n${actionLabel}: ${actionHref}` : ""

  return `${title}\n\n${intro}\n\n${detailLines}${actionLine}\n\nAgendaHora`
}

export async function sendBookingConfirmationEmails(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      business: {
        select: {
          address: true,
          city: true,
          email: true,
          name: true,
          owner: { select: { email: true, name: true } },
          timezone: true,
        },
      },
      customer: { select: { email: true, name: true } },
      resource: { select: { name: true } },
      service: { select: { name: true } },
    },
  })

  if (!booking) {
    return
  }

  const scheduledAt = formatUtcDateTimeInTimezone(booking.startsAt, booking.business.timezone)
  const customerEmail = booking.customerEmail || booking.customer.email
  const businessEmail = booking.business.email || booking.business.owner.email
  const customerName = booking.customerName || booking.customer.name || "Cliente"
  const customerBookingsUrl = buildAppUrl("/me/bookings")
  const businessBookingsUrl = buildAppUrl(`/dashboard/businesses/${booking.businessId}/bookings`)
  const businessAddress = [booking.business.address, booking.business.city].filter(Boolean).join(", ")

  const customerDetails: Array<[string, string | null | undefined]> = [
    ["Negocio", booking.business.name],
    ["Servicio", booking.service.name],
    ["Con", booking.resource.name],
    ["Fecha y hora", `${scheduledAt} (${booking.business.timezone})`],
    ["Dirección", businessAddress || null],
    ["Estado", "Confirmada"],
  ]
  const businessDetails: Array<[string, string | null | undefined]> = [
    ["Cliente", customerName],
    ["Correo", customerEmail],
    ["Teléfono", booking.customerPhone],
    ["Servicio", booking.service.name],
    ["Recurso", booking.resource.name],
    ["Fecha y hora", `${scheduledAt} (${booking.business.timezone})`],
    ["Notas", booking.notes],
  ]

  const customerEmailContent = {
    actionHref: customerBookingsUrl,
    actionLabel: "Ver mis reservas",
    details: customerDetails,
    intro: `Tu reserva en ${booking.business.name} está confirmada.`,
    title: "Reserva confirmada",
  }
  const businessEmailContent = {
    actionHref: businessBookingsUrl,
    actionLabel: "Ver reservas",
    details: businessDetails,
    intro: `Recibiste una nueva reserva para ${booking.service.name}.`,
    title: "Nueva reserva recibida",
  }

  await sendEmail({
    html: buildEmailHtml(customerEmailContent),
    subject: `Tu reserva en ${booking.business.name} está confirmada`,
    text: buildEmailText(customerEmailContent),
    to: [customerEmail],
  })

  if (businessEmail.toLowerCase() === customerEmail.toLowerCase()) {
    return
  }

  await sendEmail({
    html: buildEmailHtml(businessEmailContent),
    subject: `Nueva reserva: ${booking.service.name} - ${customerName}`,
    text: buildEmailText(businessEmailContent),
    to: [businessEmail],
  })
}
