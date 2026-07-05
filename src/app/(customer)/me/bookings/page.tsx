import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { cancelBookingByCustomerAction } from "@/features/bookings/booking.actions"
import { formatBookingStatus } from "@/features/bookings/booking-format"
import { getBookingsForCustomer } from "@/features/bookings/booking.queries"
import { canCustomerCancelBooking } from "@/features/bookings/booking-rules"
import { formatUtcDateTimeInTimezone } from "@/lib/dates"

export default async function MyBookingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const bookings = await getBookingsForCustomer(session.user.id)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Mis reservas</p>
          <h1 className="text-3xl font-semibold tracking-tight">Hola, {session.user.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/">Inicio</Link>
          </Button>
          <Button asChild>
            <Link href="/businesses">Explorar negocios</Link>
          </Button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Aun no hay reservas</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Explora negocios locales y reserva un horario disponible.
          </p>
          <Button asChild className="mt-6">
            <Link href="/businesses">Buscar negocios</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-4">
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{booking.business.name}</h2>
                    <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                      {formatBookingStatus(booking.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {booking.service.name} con {booking.resource.name}
                  </p>
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
                {canCustomerCancelBooking(booking.status) ? (
                  <form action={cancelBookingByCustomerAction}>
                    <input name="bookingId" type="hidden" value={booking.id} />
                    <Button size="sm" type="submit" variant="outline">
                      Cancelar
                    </Button>
                  </form>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
