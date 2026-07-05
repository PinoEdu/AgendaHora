import type { PrismaClient } from "@/generated/prisma/client"
import { BusinessStatus } from "@/generated/prisma/enums"
import {
  addMinutes,
  formatUtcDateInTimezone,
  getDayOfWeekForDate,
  getMinuteOfDayInTimezone,
  getUtcRangeForLocalDate,
} from "@/lib/dates"
import { prisma } from "@/lib/prisma"

import { BOOKING_CONFLICT_STATUSES, DEFAULT_BOOKING_STATUS } from "./booking.constants"
import { hasRangeConflict, isWithinAvailabilityWindow } from "./booking-rules"
import type {
  BookingAvailabilityErrorCode,
  CreateBookingInput,
  ValidateBookingAvailabilityInput,
  ValidateBookingAvailabilityOutput,
} from "./booking.types"

type BookingDbClient = Pick<
  PrismaClient,
  | "business"
  | "service"
  | "bookableResource"
  | "resourceService"
  | "availabilityRule"
  | "blockedTime"
  | "booking"
>

export class BookingAvailabilityError extends Error {
  constructor(
    message: string,
    public readonly code: BookingAvailabilityErrorCode,
  ) {
    super(message)
    this.name = "BookingAvailabilityError"
  }
}

export async function validateBookingAvailability(
  input: ValidateBookingAvailabilityInput,
  db: BookingDbClient = prisma,
): Promise<ValidateBookingAvailabilityOutput> {
  const [business, service, resource] = await Promise.all([
    db.business.findUnique({
      where: { id: input.businessId },
      select: { id: true, status: true, timezone: true },
    }),
    db.service.findFirst({
      where: { id: input.serviceId, businessId: input.businessId },
      select: { id: true, durationMinutes: true, isActive: true },
    }),
    db.bookableResource.findFirst({
      where: { id: input.resourceId, businessId: input.businessId },
      select: { id: true, isActive: true },
    }),
  ])

  if (!business) {
    throw new BookingAvailabilityError("El negocio no existe.", "BUSINESS_NOT_FOUND")
  }

  if (business.status !== BusinessStatus.ACTIVE) {
    throw new BookingAvailabilityError("El negocio no esta activo.", "BUSINESS_NOT_ACTIVE")
  }

  if (!service) {
    throw new BookingAvailabilityError("El servicio no existe.", "SERVICE_NOT_FOUND")
  }

  if (!service.isActive) {
    throw new BookingAvailabilityError("El servicio no esta activo.", "SERVICE_NOT_ACTIVE")
  }

  if (!resource) {
    throw new BookingAvailabilityError("El recurso no existe.", "RESOURCE_NOT_FOUND")
  }

  if (!resource.isActive) {
    throw new BookingAvailabilityError("El recurso no esta activo.", "RESOURCE_NOT_ACTIVE")
  }

  const resourceService = await db.resourceService.findFirst({
    where: { resourceId: input.resourceId, serviceId: input.serviceId },
    select: { id: true },
  })

  if (!resourceService) {
    throw new BookingAvailabilityError(
      "El recurso no puede prestar el servicio seleccionado.",
      "RESOURCE_SERVICE_MISMATCH",
    )
  }

  const startsAt = input.startsAt
  const endsAt = addMinutes(startsAt, service.durationMinutes)

  if (startsAt <= new Date()) {
    throw new BookingAvailabilityError("No se puede reservar en el pasado.", "BOOKING_IN_PAST")
  }

  const timezone = business.timezone
  const localDate = formatUtcDateInTimezone(startsAt, timezone)
  const localEndDate = formatUtcDateInTimezone(endsAt, timezone)
  const localStartMinute = getMinuteOfDayInTimezone(startsAt, timezone)
  const localEndMinute = getMinuteOfDayInTimezone(endsAt, timezone)

  if (localDate !== localEndDate) {
    throw new BookingAvailabilityError(
      "La reserva debe terminar dentro del mismo dia local.",
      "OUTSIDE_AVAILABILITY",
    )
  }

  const dayOfWeek = getDayOfWeekForDate(localDate)
  const localDayRange = getUtcRangeForLocalDate(localDate, timezone)
  const [availabilityRules, blockedTimes, bookings] = await Promise.all([
    db.availabilityRule.findMany({
      where: {
        resourceId: input.resourceId,
        dayOfWeek,
        isActive: true,
      },
      select: { startMinute: true, endMinute: true },
    }),
    db.blockedTime.findMany({
      where: {
        businessId: input.businessId,
        startsAt: { lt: localDayRange.endsAt },
        endsAt: { gt: localDayRange.startsAt },
        OR: [{ resourceId: null }, { resourceId: input.resourceId }],
      },
      select: { startsAt: true, endsAt: true },
    }),
    db.booking.findMany({
      where: {
        resourceId: input.resourceId,
        status: { in: [...BOOKING_CONFLICT_STATUSES] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ])

  if (!isWithinAvailabilityWindow(localStartMinute, localEndMinute, availabilityRules)) {
    throw new BookingAvailabilityError(
      "La reserva esta fuera de la disponibilidad configurada.",
      "OUTSIDE_AVAILABILITY",
    )
  }

  if (hasRangeConflict(startsAt, endsAt, blockedTimes)) {
    throw new BookingAvailabilityError(
      "El horario seleccionado esta bloqueado.",
      "BLOCKED_TIME_CONFLICT",
    )
  }

  if (hasRangeConflict(startsAt, endsAt, bookings)) {
    throw new BookingAvailabilityError(
      "El horario seleccionado ya tiene una reserva.",
      "BOOKING_CONFLICT",
    )
  }

  return {
    startsAt,
    endsAt,
    serviceDurationMinutes: service.durationMinutes,
  }
}

export async function createBooking(input: CreateBookingInput) {
  return prisma.$transaction(async (tx) => {
    const availability = await validateBookingAvailability(input, tx)

    return tx.booking.create({
      data: {
        businessId: input.businessId,
        customerId: input.customerId,
        serviceId: input.serviceId,
        resourceId: input.resourceId,
        startsAt: availability.startsAt,
        endsAt: availability.endsAt,
        status: DEFAULT_BOOKING_STATUS,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        notes: input.notes,
      },
    })
  })
}
