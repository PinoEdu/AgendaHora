import { prisma } from "@/lib/prisma"

export async function getResourcesForBlockedTimeForm(businessId: string, ownerId: string) {
  return prisma.bookableResource.findMany({
    where: {
      businessId,
      business: { ownerId },
      isActive: true,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
    },
  })
}

export async function getBlockedTimesForBusinessOwner(businessId: string, ownerId: string) {
  return prisma.blockedTime.findMany({
    where: {
      businessId,
      business: { ownerId },
      endsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
    include: {
      resource: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  })
}
