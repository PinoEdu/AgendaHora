import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
import { LogoutButton } from "@/features/auth/logout-button"
import { cancelBookingByCustomerAction } from "@/features/bookings/booking.actions"
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge"
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

function CustomerBookingCard({ booking }: { booking: CustomerBooking }) {
  const startsAtTime = formatUtcTimeInTimezone(booking.startsAt, booking.business.timezone)
  const endsAtTime = formatUtcTimeInTimezone(booking.endsAt, booking.business.timezone)

  return (
    <TicketCard className="bg-[#fffcf6]" contentClassName="grid gap-4 md:grid-cols-[8rem_1fr_auto] md:items-center">
      <div className="rounded-2xl bg-[#1e1b16] p-4 text-[#fffcf6]">
        <p className="text-xs uppercase tracking-[0.18em] text-[#f2c66d]">Hora</p>
        <p className="font-display mt-2 text-3xl font-semibold leading-none tracking-tight">{startsAtTime}</p>
        <p className="mt-1 text-xs text-[#d8cfc1]">hasta {endsAtTime}</p>
      </div>

      <div className="space-y-2">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-semibold tracking-[-0.025em]">{booking.business.name}</h3>
            <BookingStatusBadge perspective="customer" showDescription status={booking.status} />
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
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,#fff7ed,transparent_34%),linear-gradient(180deg,#fffaf2,#f7efe3)] px-6 py-10 text-[#2d241b]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#8a6240]">Mis reservas</p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.04em]">Hola, {session.user.name}</h1>
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
        <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-800 shadow-sm">
          <CalendarGrid className="opacity-35" />
          <h2 className="relative font-semibold">Reserva confirmada</h2>
          <p className="relative mt-1 text-sm">Tu horario quedo reservado. Puedes revisarlo o cancelarlo desde aqui.</p>
        </section>
      ) : null}

      {bookings.length === 0 ? (
        <EmptyState
          actionHref="/businesses"
          actionLabel="Buscar negocios"
          className="border-[#e6d8c5] bg-[#fffcf6]"
          description="Explora negocios locales, elige un servicio y confirma un horario disponible para crear tu primera reserva."
          eyebrow="Agenda personal"
          marker="0"
          title="Aun no hay reservas"
        />
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">Proximas reservas</h2>
              <p className="text-sm text-muted-foreground">Horarios pendientes o confirmados.</p>
            </div>
            {upcomingBookings.length === 0 ? (
              <EmptyState
                actionHref="/businesses"
                actionLabel="Reservar un horario"
                className="border-[#e6d8c5] bg-[#fffcf6] p-5"
                description="No hay horarios pendientes o confirmados. Reserva un servicio para verlo en esta seccion."
                eyebrow="Proximas reservas"
                marker="0"
                title="No tienes proximas reservas activas"
              />
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
              <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">Historial</h2>
              <p className="text-sm text-muted-foreground">Reservas pasadas, completadas o canceladas.</p>
            </div>
            {historyBookings.length === 0 ? (
              <EmptyState
                className="border-[#e6d8c5] bg-[#fffcf6] p-5"
                description="Cuando completes o canceles una reserva, quedara registrada aqui para referencia futura."
                eyebrow="Historial"
                marker="0"
                title="Aun no hay reservas en el historial"
              />
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
      </div>
    </main>
  )
}
