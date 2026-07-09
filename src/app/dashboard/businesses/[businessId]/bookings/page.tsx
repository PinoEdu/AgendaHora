import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import {
  cancelBookingByBusinessAction,
  markBookingCompletedAction,
  markBookingNoShowAction,
} from "@/features/bookings/booking.actions"
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge"
import { getBookingsForBusinessOwner } from "@/features/bookings/booking.queries"
import {
  canBusinessCancelBooking,
  canMarkBookingCompleted,
  canMarkBookingNoShow,
} from "@/features/bookings/booking-rules"
import { BookingStatus } from "@/generated/prisma/enums"
import { formatUtcDateTimeInTimezone, formatUtcTimeInTimezone } from "@/lib/dates"

type BusinessBookingsPageProps = {
  params: Promise<{
    businessId: string
  }>
}

export default async function BusinessBookingsPage({ params }: BusinessBookingsPageProps) {
  const { businessId } = await params
  const session = await requireBusinessOwnerSession()
  const [business, bookings] = await Promise.all([
    getBusinessForOwner(businessId, session.user.id),
    getBookingsForBusinessOwner(businessId, session.user.id),
  ])

  if (!business) {
    notFound()
  }

  const pendingBookings = bookings.filter((booking) => booking.status === BookingStatus.PENDING).length
  const confirmedBookings = bookings.filter((booking) => booking.status === BookingStatus.CONFIRMED).length
  const closedBookings = bookings.length - pendingBookings - confirmedBookings

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_right,#fde68a55,transparent_28%),linear-gradient(180deg,#f8fafc,#e2e8f0)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[#111827] p-6 text-white shadow-sm md:p-8">
        <CalendarGrid className="opacity-20" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Agenda operativa</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.045em]">Reservas recibidas</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {business.name}. Revisa atenciones pendientes, confirma cierres y marca ausencias.
            </p>
          </div>
          <Button asChild className="border-white/20 bg-white/10 text-white hover:bg-white/20" variant="outline">
            <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
          </Button>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Pendientes</p>
            <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{pendingBookings}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Confirmadas</p>
            <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{confirmedBookings}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Cerradas</p>
            <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{closedBookings}</p>
          </div>
        </div>
      </section>

      {bookings.length === 0 ? (
        <EmptyState
          actionHref={`/businesses/${business.slug}`}
          actionLabel="Ver perfil publico"
          className="border-slate-200 bg-white"
          description="Cuando un cliente reserve online, aparecera aqui con hora, servicio, recurso y acciones operativas."
          eyebrow="Agenda operativa"
          marker="0"
          title="Aun no hay reservas"
        />
      ) : (
        <section className="grid gap-4">
          {bookings.map((booking) => {
            const startsAtTime = formatUtcTimeInTimezone(booking.startsAt, booking.business.timezone)
            const endsAtTime = formatUtcTimeInTimezone(booking.endsAt, booking.business.timezone)

            return (
              <TicketCard className="border-slate-200 bg-white" key={booking.id} contentClassName="grid gap-5 lg:grid-cols-[8rem_1fr_auto] lg:items-center">
                <div className="rounded-2xl bg-[#111827] p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Hora</p>
                  <p className="font-display mt-2 text-3xl font-semibold leading-none tracking-tight">{startsAtTime}</p>
                  <p className="mt-1 text-xs text-slate-300">hasta {endsAtTime}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">{booking.service.name}</h2>
                    <BookingStatusBadge showDescription status={booking.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {booking.customer.name || booking.customerName || "Sin nombre"} ·{" "}
                    {booking.customer.email || booking.customerEmail || "Sin email"}
                  </p>
                  <p className="text-sm text-muted-foreground">Recurso: {booking.resource.name}</p>
                  <p className="text-sm font-medium">
                    {formatUtcDateTimeInTimezone(booking.startsAt, booking.business.timezone)} -{" "}
                    {formatUtcDateTimeInTimezone(booking.endsAt, booking.business.timezone)}
                  </p>
                  {booking.cancelledAt ? (
                    <p className="text-xs text-muted-foreground">
                      Cancelada: {booking.cancellationReason || "Sin motivo"}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {canMarkBookingCompleted(booking.status) ? (
                    <form action={markBookingCompletedAction}>
                      <input name="businessId" type="hidden" value={business.id} />
                      <input name="bookingId" type="hidden" value={booking.id} />
                      <Button size="sm" type="submit" variant="outline">
                        Completar
                      </Button>
                    </form>
                  ) : null}

                  {canMarkBookingNoShow(booking.status) ? (
                    <form action={markBookingNoShowAction}>
                      <input name="businessId" type="hidden" value={business.id} />
                      <input name="bookingId" type="hidden" value={booking.id} />
                      <Button size="sm" type="submit" variant="outline">
                        No-show
                      </Button>
                    </form>
                  ) : null}

                  {canBusinessCancelBooking(booking.status) ? (
                    <form action={cancelBookingByBusinessAction}>
                      <input name="businessId" type="hidden" value={business.id} />
                      <input name="bookingId" type="hidden" value={booking.id} />
                      <Button size="sm" type="submit" variant="outline">
                        Cancelar
                      </Button>
                    </form>
                  ) : null}
                </div>
              </TicketCard>
            )
          })}
        </section>
      )}
      </div>
    </main>
  )
}
