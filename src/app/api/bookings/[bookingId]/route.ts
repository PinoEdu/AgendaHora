import type { NextRequest } from "next/server"

import { auth } from "@/auth"
import { sendBookingRescheduledEmails } from "@/features/bookings/booking-email.service"
import {
  BookingAvailabilityError,
  rescheduleBooking,
} from "@/features/bookings/booking.service"
import { rescheduleBookingSchema } from "@/features/bookings/booking.validators"
import { prisma } from "@/lib/prisma"

type BookingRouteProps = {
  params: Promise<{
    bookingId: string
  }>
}

export async function PATCH(request: NextRequest, { params }: BookingRouteProps) {
  const session = await auth()

  if (!session?.user) {
    return Response.json(
      { error: "Debes iniciar sesión para reprogramar una reserva.", code: "UNAUTHORIZED" },
      { status: 401 },
    )
  }

  const { bookingId } = await params
  const body: unknown = await request.json().catch(() => null)
  const parsedBody = rescheduleBookingSchema.safeParse(body)

  if (!parsedBody.success) {
    return Response.json(
      {
        error: parsedBody.error.issues[0]?.message ?? "Datos inválidos.",
        code: "INVALID_BODY",
      },
      { status: 400 },
    )
  }

  const previousBooking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: session.user.id },
    select: { endsAt: true, startsAt: true },
  })

  try {
    const booking = await rescheduleBooking({
      bookingId,
      customerId: session.user.id,
      startsAt: parsedBody.data.startsAt,
    })

    if (previousBooking) {
      try {
        await sendBookingRescheduledEmails({
          bookingId: booking.id,
          previousEndsAt: previousBooking.endsAt,
          previousStartsAt: previousBooking.startsAt,
        })
      } catch (emailError) {
        console.error("Reserva reprogramada, pero no se pudo enviar el email.", emailError)
      }
    }

    return Response.json({
      booking: {
        businessId: booking.businessId,
        endsAt: booking.endsAt.toISOString(),
        id: booking.id,
        resourceId: booking.resourceId,
        serviceId: booking.serviceId,
        startsAt: booking.startsAt.toISOString(),
        status: booking.status,
      },
    })
  } catch (error) {
    if (error instanceof BookingAvailabilityError) {
      return Response.json({ error: error.message, code: error.code }, { status: 400 })
    }

    console.error(error)

    return Response.json(
      { error: "No se pudo reprogramar la reserva.", code: "INTERNAL_ERROR" },
      { status: 500 },
    )
  }
}
