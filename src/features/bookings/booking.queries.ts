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
