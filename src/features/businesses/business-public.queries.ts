import { BusinessStatus } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

export async function getPublicBusinesses() {
  const businesses = await prisma.business.findMany({
    where: { status: BusinessStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { services: true, resources: true } },
    },
  })

  return businesses.map((business) => ({
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    city: business.city,
    address: business.address,
    categoryName: business.category.name,
    servicesCount: business._count.services,
    resourcesCount: business._count.resources,
  }))
}

export async function getPublicBusinessBySlug(slug: string) {
  const business = await prisma.business.findFirst({
    where: { slug, status: BusinessStatus.ACTIVE },
    include: {
      category: { select: { name: true } },
      services: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          durationMinutes: true,
          price: true,
          resources: { select: { resourceId: true } },
        },
      },
      resources: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          services: { select: { serviceId: true } },
        },
      },
    },
  })

  if (!business) {
    return null
  }

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    phone: business.phone,
    email: business.email,
    address: business.address,
    city: business.city,
    country: business.country,
    timezone: business.timezone,
    categoryName: business.category.name,
    services: business.services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price.toString(),
      resourceIds: service.resources.map((resourceService) => resourceService.resourceId),
    })),
    resources: business.resources.map((resource) => ({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      description: resource.description,
      serviceIds: resource.services.map((resourceService) => resourceService.serviceId),
    })),
  }
}
