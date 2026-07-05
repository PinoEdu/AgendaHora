import { BusinessStatus } from "@/generated/prisma/enums"
import { getDayOfWeekForDate, getUtcRangeForLocalDate } from "@/lib/dates"
import { prisma } from "@/lib/prisma"

import { BLOCKING_BOOKING_STATUSES } from "./availability.constants"
import { buildAvailableSlotsForRules } from "./availability-slots"
import type { GetAvailableSlotsInput, GetAvailableSlotsOutput } from "./availability.types"

export class AvailabilityError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message)
    this.name = "AvailabilityError"
  }
}

export async function getAvailableSlots(
  input: GetAvailableSlotsInput,
): Promise<GetAvailableSlotsOutput> {
  const [business, service, resource] = await Promise.all([
    prisma.business.findUnique({
      where: { id: input.businessId },
      select: {
        id: true,
        status: true,
        timezone: true,
      },
    }),
    prisma.service.findFirst({
      where: {
        id: input.serviceId,
        businessId: input.businessId,
      },
      select: {
        id: true,
        durationMinutes: true,
        isActive: true,
      },
    }),
    prisma.bookableResource.findFirst({
      where: {
        id: input.resourceId,
        businessId: input.businessId,
      },
      select: {
        id: true,
        isActive: true,
      },
    }),
  ])

  if (!business) {
    throw new AvailabilityError("El negocio no existe.", "BUSINESS_NOT_FOUND")
  }

  if (business.status !== BusinessStatus.ACTIVE) {
    throw new AvailabilityError("El negocio no esta activo.", "BUSINESS_NOT_ACTIVE")
  }

  if (!service) {
    throw new AvailabilityError("El servicio no existe.", "SERVICE_NOT_FOUND")
  }

  if (!service.isActive) {
    throw new AvailabilityError("El servicio no esta activo.", "SERVICE_NOT_ACTIVE")
  }

  if (!resource) {
    throw new AvailabilityError("El recurso no existe.", "RESOURCE_NOT_FOUND")
  }

  if (!resource.isActive) {
    throw new AvailabilityError("El recurso no esta activo.", "RESOURCE_NOT_ACTIVE")
  }

  const resourceService = await prisma.resourceService.findFirst({
    where: {
      resourceId: input.resourceId,
      serviceId: input.serviceId,
    },
    select: { id: true },
  })

  if (!resourceService) {
    throw new AvailabilityError(
      "El recurso no puede prestar el servicio seleccionado.",
      "RESOURCE_SERVICE_MISMATCH",
    )
  }

  const timezone = business.timezone
  const dayOfWeek = getDayOfWeekForDate(input.date)
  const localDayRange = getUtcRangeForLocalDate(input.date, timezone)

  const [rules, blockedTimes, bookings] = await Promise.all([
    prisma.availabilityRule.findMany({
      where: {
        resourceId: input.resourceId,
        dayOfWeek,
        isActive: true,
      },
      orderBy: { startMinute: "asc" },
      select: {
        startMinute: true,
        endMinute: true,
      },
    }),
    prisma.blockedTime.findMany({
      where: {
        businessId: input.businessId,
        startsAt: { lt: localDayRange.endsAt },
        endsAt: { gt: localDayRange.startsAt },
        OR: [{ resourceId: null }, { resourceId: input.resourceId }],
      },
      select: {
        startsAt: true,
        endsAt: true,
      },
    }),
    prisma.booking.findMany({
      where: {
        resourceId: input.resourceId,
        status: { in: [...BLOCKING_BOOKING_STATUSES] },
        startsAt: { lt: localDayRange.endsAt },
        endsAt: { gt: localDayRange.startsAt },
      },
      select: {
        startsAt: true,
        endsAt: true,
      },
    }),
  ])

  const conflicts = [...blockedTimes, ...bookings]
  const slots = buildAvailableSlotsForRules({
    date: input.date,
    timezone,
    durationMinutes: service.durationMinutes,
    rules,
    conflicts,
  })

  return {
    timezone,
    slots,
  }
}
