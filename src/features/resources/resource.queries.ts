import { prisma } from "@/lib/prisma"

export async function getResourcesForBusinessOwner(businessId: string, ownerId: string) {
  return prisma.bookableResource.findMany({
    where: {
      businessId,
      business: { ownerId },
    },
    orderBy: { createdAt: "desc" },
    include: {
      services: {
        include: {
          service: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: {
          bookings: true,
          availabilityRules: true,
          blockedTimes: true,
        },
      },
    },
  })
}

export async function getResourceForBusinessOwner(
  businessId: string,
  resourceId: string,
  ownerId: string,
) {
  return prisma.bookableResource.findFirst({
    where: {
      id: resourceId,
      businessId,
      business: { ownerId },
    },
    include: {
      services: {
        select: { serviceId: true },
      },
    },
  })
}
