import { prisma } from "@/lib/prisma"

export async function getServicesForBusinessOwner(businessId: string, ownerId: string) {
  return prisma.service.findMany({
    where: {
      businessId,
      business: { ownerId },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { resources: true, bookings: true },
      },
    },
  })
}

export async function getActiveServicesForBusinessOwner(businessId: string, ownerId: string) {
  return prisma.service.findMany({
    where: {
      businessId,
      business: { ownerId },
      isActive: true,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  })
}

export async function getServiceForBusinessOwner(
  businessId: string,
  serviceId: string,
  ownerId: string,
) {
  return prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId,
      business: { ownerId },
    },
  })
}
