import Link from "next/link"
import { notFound } from "next/navigation"

import {
  DashboardHero,
  DashboardShell,
  dashboardCardClassName,
  dashboardMetricClassName,
} from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
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
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
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
    <DashboardShell>
      <DashboardHero
        actions={(
          <Button asChild className="border-white/20 bg-white/10 text-[#fffcf6] hover:bg-white/20" variant="outline">
            <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
          </Button>
        )}
        description={`${business.name}. Revisa atenciones pendientes, confirma cierres y marca ausencias.`}
        eyebrow="Agenda operativa"
        title="Reservas recibidas"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Pendientes", pendingBookings],
            ["Confirmadas", confirmedBookings],
            ["Cerradas", closedBookings],
          ].map(([label, value]) => (
            <div className={dashboardMetricClassName} key={label}>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8cfc1]">{label}</p>
              <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </DashboardHero>

      {bookings.length === 0 ? (
        <EmptyState
          actionHref={`/businesses/${business.slug}`}
          actionLabel="Ver perfil público"
          className={dashboardCardClassName}
          description="Cuando un cliente reserve online, aparecerá aquí con hora, servicio, recurso y acciones operativas."
          eyebrow="Agenda operativa"
          marker="0"
          title="Aún no hay reservas"
        />
      ) : (
        <section className="grid gap-4">
          {bookings.map((booking) => {
            const startsAtTime = formatUtcTimeInTimezone(booking.startsAt, booking.business.timezone)
            const endsAtTime = formatUtcTimeInTimezone(booking.endsAt, booking.business.timezone)

            return (
              <TicketCard className={dashboardCardClassName} key={booking.id} contentClassName="grid gap-5 lg:grid-cols-[8rem_1fr_auto] lg:items-center">
                <div className="rounded-2xl bg-[#1e1b16] p-4 text-[#fffcf6]">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#f2c66d]">Hora</p>
                  <p className="font-display mt-2 text-3xl font-semibold leading-none tracking-tight">{startsAtTime}</p>
                  <p className="mt-1 text-xs text-[#d8cfc1]">hasta {endsAtTime}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">{booking.service.name}</h2>
                    <BookingStatusBadge showDescription status={booking.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {booking.customer.name || booking.customerName || "Sin nombre"} ·{" "}
                    {booking.customer.email || booking.customerEmail || "Sin correo"}
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
    </DashboardShell>
  )
}
