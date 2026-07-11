import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { getBookingForCustomer } from "@/features/bookings/booking.queries"
import { canCustomerRescheduleBooking } from "@/features/bookings/booking-rules"
import { RescheduleBookingFlow } from "@/features/bookings/reschedule-booking-flow"
import { formatUtcDateInTimezone, formatUtcTimeInTimezone } from "@/lib/dates"

type RescheduleBookingPageProps = {
  params: Promise<{
    bookingId: string
  }>
}

export default async function RescheduleBookingPage({ params }: RescheduleBookingPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { bookingId } = await params
  const booking = await getBookingForCustomer(bookingId, session.user.id)

  if (!booking) {
    notFound()
  }

  const canReschedule = canCustomerRescheduleBooking(booking.status, booking.startsAt)
  const currentDate = formatUtcDateInTimezone(booking.startsAt, booking.business.timezone)

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f8f5ef] px-6 py-10 text-[#1e1b16]">
      <CalendarGrid className="opacity-40 [mask-image:radial-gradient(circle_at_top_left,black,transparent_56%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm md:p-8">
          <CalendarGrid className="opacity-65" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#8a7058]">
                <Link className="underline-offset-4 hover:underline" href="/me/bookings">
                  Mis reservas
                </Link>{" "}
                / Reprogramar
              </p>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a7058]">Cambio de horario</p>
                <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                  Reprogramar reserva
                </h1>
                <p className="mt-3 max-w-2xl text-[#655b4f]">
                  Elige una nueva fecha y hora para {booking.service.name} en {booking.business.name}.
                </p>
              </div>
            </div>
            <Button asChild className="border-[#d6c7b5] bg-white" variant="outline">
              <Link href="/me/bookings">Volver</Link>
            </Button>
          </div>
        </div>

        {canReschedule ? (
          <RescheduleBookingFlow
            booking={{
              business: {
                name: booking.business.name,
                timezone: booking.business.timezone,
              },
              currentDate,
              currentEndTime: formatUtcTimeInTimezone(booking.endsAt, booking.business.timezone),
              currentStartTime: formatUtcTimeInTimezone(booking.startsAt, booking.business.timezone),
              id: booking.id,
              resource: {
                name: booking.resource.name,
              },
              service: {
                durationMinutes: booking.service.durationMinutes,
                name: booking.service.name,
              },
            }}
          />
        ) : (
          <EmptyState
            actionHref="/me/bookings"
            actionLabel="Volver a mis reservas"
            className="rounded-[2rem] border-[#e6d8c5] bg-[#fffcf6]"
            description="Solo puedes reprogramar reservas pendientes o confirmadas con más de 4 horas de anticipación."
            eyebrow="Reprogramación no disponible"
            marker="4h"
            title="Esta reserva ya no se puede reprogramar"
          />
        )}
      </div>
    </main>
  )
}
