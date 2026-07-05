import { prisma } from "@/lib/prisma"

export async function getBookingsForCustomer(customerId: string) {
  return prisma.booking.findMany({
    where: { customerId },
    orderBy: { startsAt: "desc" },
    include: {
      business: { select: { name: true, timezone: true } },
      service: { select: { name: true, durationMinutes: true } },
      resource: { select: { name: true } },
    },
  })
}
