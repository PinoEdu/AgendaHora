import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { TicketCard } from "@/components/ui/ticket-card"
import { LogoutButton } from "@/features/auth/logout-button"
import { cancelBookingByCustomerAction } from "@/features/bookings/booking.actions"
import { formatBookingStatus } from "@/features/bookings/booking-format"
import { getBookingsForCustomer } from "@/features/bookings/booking.queries"
import { canCustomerCancelBooking } from "@/features/bookings/booking-rules"
import { BookingStatus } from "@/generated/prisma/enums"
import { formatUtcDateTimeInTimezone, formatUtcTimeInTimezone } from "@/lib/dates"

type MyBookingsPageProps = {
  searchParams: Promise<{
    created?: string
  }>
}

type CustomerBooking = Awaited<ReturnType<typeof getBookingsForCustomer>>[number]

const upcomingStatuses = new Set<BookingStatus>([BookingStatus.PENDING, BookingStatus.CONFIRMED])

const bookingStatusClasses: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "border-amber-200 bg-amber-50 text-amber-800",
  [BookingStatus.CONFIRMED]: "border-emerald-200 bg-emerald-50 text-emerald-800",
  [BookingStatus.CANCELLED_BY_CUSTOMER]: "border-stone-200 bg-stone-50 text-stone-600",
  [BookingStatus.CANCELLED_BY_BUSINESS]: "border-stone-200 bg-stone-50 text-stone-600",
  [BookingStatus.COMPLETED]: "border-sky-200 bg-sky-50 text-sky-800",
  [BookingStatus.NO_SHOW]: "border-red-200 bg-red-50 text-red-800",
}

function CustomerBookingCard({ booking }: { booking: CustomerBooking }) {
  const startsAtTime = formatUtcTimeInTimezone(booking.startsAt, booking.business.timezone)
  const endsAtTime = formatUtcTimeInTimezone(booking.endsAt, booking.business.timezone)

  return (
    <TicketCard className="bg-[#fffcf6]" contentClassName="grid gap-4 md:grid-cols-[8rem_1fr_auto] md:items-center">
      <div className="rounded-2xl bg-[#1e1b16] p-4 text-[#fffcf6]">
        <p className="text-xs uppercase tracking-[0.18em] text-[#f2c66d]">Hora</p>
        <p className="mt-2 text-3xl font-semibold leading-none">{startsAtTime}</p>
        <p className="mt-1 text-xs text-[#d8cfc1]">hasta {endsAtTime}</p>
      </div>

      <div className="space-y-2">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold">{booking.business.name}</h3>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${bookingStatusClasses[booking.status]}`}>
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
      </div>

      {canCustomerCancelBooking(booking.status) ? (
        <form action={cancelBookingByCustomerAction} className="md:justify-self-end">
          <input name="bookingId" type="hidden" value={booking.id} />
          <Button size="sm" type="submit" variant="outline">
            Cancelar
          </Button>
        </form>
      ) : null}
    </TicketCard>
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
