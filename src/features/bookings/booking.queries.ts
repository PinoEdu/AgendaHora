import { prisma } from "@/lib/prisma"

export async function getBookingsForCustomer(customerId: string) {
  return prisma.booking.findMany({
    where: { customerId },
    orderBy: { startsAt: "asc" },
    include: {
      business: { select: { name: true, timezone: true } },
      service: { select: { name: true, durationMinutes: true } },
      resource: { select: { name: true } },
    },
  })
}

export async function getBookingForCustomer(bookingId: string, customerId: string) {
  return prisma.booking.findFirst({
    where: { customerId, id: bookingId },
    include: {
      business: { select: { id: true, name: true, timezone: true } },
      service: { select: { name: true, durationMinutes: true } },
      resource: { select: { name: true } },
    },
  })
}

export async function getBookingsForBusinessOwner(businessId: string, ownerId: string) {
  return prisma.booking.findMany({
    where: {
      businessId,
      business: { ownerId },
    },
    orderBy: { startsAt: "asc" },
    include: {
      business: { select: { name: true, timezone: true } },
      customer: { select: { name: true, email: true } },
      service: { select: { name: true, durationMinutes: true } },
      resource: { select: { name: true } },
    },
  })
}
