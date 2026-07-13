import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
import { cancelBookingByCustomerAction } from "@/features/bookings/booking.actions"
import { BookingStatusBadge } from "@/features/bookings/booking-status-badge"
import {
  getBookingHistoryForCustomer,
  getUpcomingBookingsForCustomer,
} from "@/features/bookings/booking.queries"
import { canCustomerCancelBooking, canCustomerRescheduleBooking } from "@/features/bookings/booking-rules"
import { formatUtcDisplayDateInTimezone, formatUtcTimeInTimezone } from "@/lib/dates"

type MyBookingsPageProps = {
  searchParams: Promise<{
    created?: string
    historyPage?: string
    rescheduled?: string
  }>
}

type CustomerBooking = Awaited<ReturnType<typeof getUpcomingBookingsForCustomer>>[number]

const HISTORY_PAGE_SIZE = 10

function parseHistoryPage(value: string | undefined) {
  const page = Number(value)

  if (!Number.isInteger(page) || page < 1) {
    return 1
  }

  return page
}

function buildHistoryPageHref({
  created,
  page,
  rescheduled,
}: {
  created?: string
  page: number
  rescheduled?: string
}) {
  const searchParams = new URLSearchParams()

  if (created) {
    searchParams.set("created", created)
  }

  if (rescheduled) {
    searchParams.set("rescheduled", rescheduled)
  }

  if (page > 1) {
    searchParams.set("historyPage", String(page))
  }

  const queryString = searchParams.toString()

  return queryString ? `/me/bookings?${queryString}` : "/me/bookings"
}

function CustomerBookingCard({ booking }: { booking: CustomerBooking }) {
  const startsAtTime = formatUtcTimeInTimezone(booking.startsAt, booking.business.timezone)
  const endsAtTime = formatUtcTimeInTimezone(booking.endsAt, booking.business.timezone)
  const bookingDate = formatUtcDisplayDateInTimezone(booking.startsAt, booking.business.timezone)

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
            <BookingStatusBadge perspective="customer" status={booking.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {booking.service.name} con {booking.resource.name}
          </p>
          <p className="text-sm font-medium">Fecha: {bookingDate}</p>
          <p className="text-xs text-muted-foreground">
            Duración: {booking.service.durationMinutes} min · Zona horaria: {booking.business.timezone}
          </p>
        </div>
      </div>

      {canCustomerRescheduleBooking(booking.status, booking.startsAt) || canCustomerCancelBooking(booking.status) ? (
        <div className="flex flex-wrap gap-2 md:justify-self-end">
          {canCustomerRescheduleBooking(booking.status, booking.startsAt) ? (
            <Button asChild size="sm" variant="outline">
              <Link href={`/me/bookings/${booking.id}/reschedule`}>Reprogramar</Link>
            </Button>
          ) : null}

          {canCustomerCancelBooking(booking.status) ? (
            <form action={cancelBookingByCustomerAction}>
              <input name="bookingId" type="hidden" value={booking.id} />
              <Button size="sm" type="submit" variant="outline">
                Cancelar
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
    </TicketCard>
  )
}

export default async function MyBookingsPage({ searchParams }: MyBookingsPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { created, historyPage, rescheduled } = await searchParams
  const requestedHistoryPage = parseHistoryPage(historyPage)
  const now = new Date()
  const [upcomingBookings, history] = await Promise.all([
    getUpcomingBookingsForCustomer(session.user.id, now),
    getBookingHistoryForCustomer({
      customerId: session.user.id,
      now,
      page: requestedHistoryPage,
      pageSize: HISTORY_PAGE_SIZE,
    }),
  ])
  const hasAnyBookings = upcomingBookings.length > 0 || history.total > 0

  return (
    <main className="px-6 py-10 text-[#2d241b]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div>
        <div>
          <p className="text-sm font-medium text-[#8a6240]">Mis reservas</p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.04em]">Hola, {session.user.name}</h1>
        </div>
      </div>

      {created === "1" ? (
        <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-800 shadow-sm">
          <CalendarGrid className="opacity-35" />
          <h2 className="relative font-semibold">Reserva confirmada</h2>
          <p className="relative mt-1 text-sm">Tu horario quedó reservado. Puedes revisarlo o cancelarlo desde aquí.</p>
        </section>
      ) : null}

      {rescheduled === "1" ? (
        <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-800 shadow-sm">
          <CalendarGrid className="opacity-35" />
          <h2 className="relative font-semibold">Reserva reprogramada</h2>
          <p className="relative mt-1 text-sm">Actualizamos tu horario y enviaremos la notificación correspondiente.</p>
        </section>
      ) : null}

      {hasAnyBookings ? (
        <div className="space-y-8">
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">Próximas reservas</h2>
              <p className="text-sm text-muted-foreground">Horarios pendientes o confirmados.</p>
            </div>
            {upcomingBookings.length === 0 ? (
              <EmptyState
                actionHref="/businesses"
                actionLabel="Reservar un horario"
                className="border-[#e6d8c5] bg-[#fffcf6] p-5"
                description="No hay horarios pendientes o confirmados. Reserva un servicio para verlo en esta sección."
                eyebrow="Próximas reservas"
                marker="0"
                title="No tienes próximas reservas activas"
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
            {history.bookings.length === 0 ? (
              <EmptyState
                className="border-[#e6d8c5] bg-[#fffcf6] p-5"
                description="Cuando completes o canceles una reserva, quedará registrada aquí para referencia futura."
                eyebrow="Historial"
                marker="0"
                title="Aún no hay reservas en el historial"
              />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {history.bookings.map((booking) => (
                    <CustomerBookingCard booking={booking} key={booking.id} />
                  ))}
                </div>

                {history.totalPages > 1 ? (
                  <nav className="flex flex-col gap-3 rounded-2xl border border-[#e6d8c5] bg-[#fffcf6] p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                    {history.page > 1 ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={buildHistoryPageHref({ created, page: history.page - 1, rescheduled })}>Anterior</Link>
                      </Button>
                    ) : (
                      <Button disabled size="sm" variant="outline">
                        Anterior
                      </Button>
                    )}
                    <p className="text-center text-muted-foreground">
                      Página {history.page} de {history.totalPages}
                    </p>
                    {history.page < history.totalPages ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={buildHistoryPageHref({ created, page: history.page + 1, rescheduled })}>Siguiente</Link>
                      </Button>
                    ) : (
                      <Button disabled size="sm" variant="outline">
                        Siguiente
                      </Button>
                    )}
                  </nav>
                ) : null}
              </div>
            )}
          </section>
        </div>
      ) : (
        <EmptyState
          actionHref="/businesses"
          actionLabel="Buscar negocios"
          className="border-[#e6d8c5] bg-[#fffcf6]"
          description="Explora negocios locales, elige un servicio y confirma un horario disponible para crear tu primera reserva."
          eyebrow="Agenda personal"
          marker="0"
          title="Aún no hay reservas"
        />
      )}
      </div>
    </main>
  )
}
