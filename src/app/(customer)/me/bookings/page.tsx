import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/features/auth/logout-button"
import { cancelBookingByCustomerAction } from "@/features/bookings/booking.actions"
import { formatBookingStatus } from "@/features/bookings/booking-format"
import { getBookingsForCustomer } from "@/features/bookings/booking.queries"
import { canCustomerCancelBooking } from "@/features/bookings/booking-rules"
import { BookingStatus } from "@/generated/prisma/enums"
import { formatUtcDateTimeInTimezone } from "@/lib/dates"

type MyBookingsPageProps = {
  searchParams: Promise<{
    created?: string
  }>
}

type CustomerBooking = Awaited<ReturnType<typeof getBookingsForCustomer>>[number]

const upcomingStatuses = new Set<BookingStatus>([BookingStatus.PENDING, BookingStatus.CONFIRMED])

function CustomerBookingCard({ booking }: { booking: CustomerBooking }) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold">{booking.business.name}</h3>
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
          <p className="text-xs text-muted-foreground">
            Duracion: {booking.service.durationMinutes} min · Zona horaria: {booking.business.timezone}
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
  )
}

export default async function MyBookingsPage({ searchParams }: MyBookingsPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const [{ created }, bookings] = await Promise.all([
    searchParams,
    getBookingsForCustomer(session.user.id),
  ])
  const now = new Date()
  const upcomingBookings = bookings.filter(
    (booking) => upcomingStatuses.has(booking.status) && booking.startsAt >= now,
  )
  const historyBookings = bookings.filter((booking) => !upcomingBookings.includes(booking))

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Mis reservas</p>
          <h1 className="text-3xl font-semibold tracking-tight">Hola, {session.user.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/">Inicio</Link>
          </Button>
          <Button asChild>
            <Link href="/businesses">Explorar negocios</Link>
          </Button>
          <LogoutButton />
        </div>
      </div>

      {created === "1" ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          <h2 className="font-semibold">Reserva confirmada</h2>
          <p className="mt-1 text-sm">Tu horario quedo reservado. Puedes revisarlo o cancelarlo desde aqui.</p>
        </section>
      ) : null}

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
        <div className="space-y-8">
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Proximas reservas</h2>
              <p className="text-sm text-muted-foreground">Horarios pendientes o confirmados.</p>
            </div>
            {upcomingBookings.length === 0 ? (
              <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
                No tienes proximas reservas activas.
              </p>
            ) : (
              <div className="grid gap-4">
                {upcomingBookings.map((booking) => (
                  <CustomerBookingCard booking={booking} key={booking.id} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Historial</h2>
              <p className="text-sm text-muted-foreground">Reservas pasadas, completadas o canceladas.</p>
            </div>
            {historyBookings.length === 0 ? (
              <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
                Aun no hay reservas en el historial.
              </p>
            ) : (
              <div className="grid gap-4">
                {historyBookings.map((booking) => (
                  <CustomerBookingCard booking={booking} key={booking.id} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
