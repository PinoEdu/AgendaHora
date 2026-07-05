import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import {
  cancelBookingByBusinessAction,
  markBookingCompletedAction,
  markBookingNoShowAction,
} from "@/features/bookings/booking.actions"
import { formatBookingStatus } from "@/features/bookings/booking-format"
import { getBookingsForBusinessOwner } from "@/features/bookings/booking.queries"
import {
  canBusinessCancelBooking,
  canMarkBookingCompleted,
  canMarkBookingNoShow,
} from "@/features/bookings/booking-rules"
import { formatUtcDateTimeInTimezone } from "@/lib/dates"

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

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{business.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Reservas recibidas</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Aun no hay reservas</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Cuando un cliente reserve online, aparecera en esta vista.
          </p>
        </section>
      ) : (
        <section className="grid gap-4">
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{booking.service.name}</h2>
                    <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                      {formatBookingStatus(booking.status)}
                    </span>
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

                <div className="flex flex-wrap gap-2">
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
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
