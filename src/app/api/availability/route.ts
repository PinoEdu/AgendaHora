import type { NextRequest } from "next/server"

import {
  AvailabilityError,
  getAvailableSlots,
} from "@/features/availability/availability.service"
import { getAvailableSlotsSchema } from "@/features/availability/availability.validators"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const parsedQuery = getAvailableSlotsSchema.safeParse({
    businessId: searchParams.get("businessId"),
    serviceId: searchParams.get("serviceId"),
    resourceId: searchParams.get("resourceId"),
    date: searchParams.get("date"),
  })

  if (!parsedQuery.success) {
    return Response.json(
      {
        error: parsedQuery.error.issues[0]?.message ?? "Parametros invalidos.",
        code: "INVALID_QUERY",
      },
      { status: 400 },
    )
  }

  try {
    const availability = await getAvailableSlots(parsedQuery.data)

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
