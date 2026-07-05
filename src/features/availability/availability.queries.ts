import { prisma } from "@/lib/prisma"

export async function getResourcesForAvailabilityForm(businessId: string, ownerId: string) {
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

export async function getAvailabilityRulesForBusinessOwner(businessId: string, ownerId: string) {
  return prisma.availabilityRule.findMany({
    where: {
      resource: {
        businessId,
        business: { ownerId },
      },
    },
    orderBy: [{ resource: { name: "asc" } }, { dayOfWeek: "asc" }, { startMinute: "asc" }],
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
