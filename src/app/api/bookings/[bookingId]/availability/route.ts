import type { NextRequest } from "next/server"

import { auth } from "@/auth"
import {
  AvailabilityError,
  getAvailableSlots,
} from "@/features/availability/availability.service"
import { canCustomerRescheduleBooking } from "@/features/bookings/booking-rules"
import { rescheduleAvailabilitySchema } from "@/features/bookings/booking.validators"
import { prisma } from "@/lib/prisma"

type BookingAvailabilityRouteProps = {
  params: Promise<{
    bookingId: string
  }>
}

export async function GET(request: NextRequest, { params }: BookingAvailabilityRouteProps) {
  const session = await auth()

  if (!session?.user) {
    return Response.json(
      { error: "Debes iniciar sesión para consultar disponibilidad.", code: "UNAUTHORIZED" },
      { status: 401 },
    )
  }

  const { bookingId } = await params
  const parsedQuery = rescheduleAvailabilitySchema.safeParse({
    date: request.nextUrl.searchParams.get("date"),
  })

  if (!parsedQuery.success) {
    return Response.json(
      {
        error: parsedQuery.error.issues[0]?.message ?? "Parámetros inválidos.",
        code: "INVALID_QUERY",
      },
      { status: 400 },
    )
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: session.user.id },
    select: {
      businessId: true,
      id: true,
      resourceId: true,
      serviceId: true,
      startsAt: true,
      status: true,
    },
  })

  if (!booking) {
    return Response.json({ error: "La reserva no existe.", code: "BOOKING_NOT_FOUND" }, { status: 404 })
  }

  if (!canCustomerRescheduleBooking(booking.status, booking.startsAt)) {
    return Response.json(
      {
        error: "Solo puedes reprogramar reservas activas con más de 4 horas de anticipación.",
        code: "BOOKING_NOT_RESCHEDULABLE",
      },
      { status: 400 },
    )
  }

  try {
    const availability = await getAvailableSlots({
      businessId: booking.businessId,
      date: parsedQuery.data.date,
      resourceId: booking.resourceId,
      serviceId: booking.serviceId,
    })

    return Response.json(availability)
  } catch (error) {
    if (error instanceof AvailabilityError) {
      return Response.json({ error: error.message, code: error.code }, { status: 400 })
    }

    console.error(error)

    return Response.json(
      { error: "No se pudo consultar la disponibilidad.", code: "INTERNAL_ERROR" },
      { status: 500 },
    )
  }
}
