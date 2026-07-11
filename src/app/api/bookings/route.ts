import type { NextRequest } from "next/server"

import { auth } from "@/auth"
import { sendBookingConfirmationEmails } from "@/features/bookings/booking-email.service"
import {
  BookingAvailabilityError,
  createBooking,
} from "@/features/bookings/booking.service"
import { createBookingSchema } from "@/features/bookings/booking.validators"

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return Response.json(
      { error: "Debes iniciar sesión para crear una reserva.", code: "UNAUTHORIZED" },
      { status: 401 },
    )
  }

  const body: unknown = await request.json().catch(() => null)
  const parsedBody = createBookingSchema.safeParse(body)

  if (!parsedBody.success) {
    return Response.json(
      {
        error: parsedBody.error.issues[0]?.message ?? "Datos inválidos.",
        code: "INVALID_BODY",
      },
      { status: 400 },
    )
  }

  try {
    const booking = await createBooking({
      ...parsedBody.data,
      customerId: session.user.id,
    })

    try {
      await sendBookingConfirmationEmails(booking.id)
    } catch (emailError) {
      console.error("Reserva creada, pero no se pudo enviar la confirmación por email.", emailError)
    }

    return Response.json(
      {
        booking: {
          id: booking.id,
          businessId: booking.businessId,
          serviceId: booking.serviceId,
          resourceId: booking.resourceId,
          startsAt: booking.startsAt.toISOString(),
          endsAt: booking.endsAt.toISOString(),
          status: booking.status,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof BookingAvailabilityError) {
      return Response.json({ error: error.message, code: error.code }, { status: 400 })
    }

    console.error(error)

    return Response.json(
      { error: "No se pudo crear la reserva.", code: "INTERNAL_ERROR" },
      { status: 500 },
    )
  }
}
