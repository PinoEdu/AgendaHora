import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { UserRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

export async function requireBusinessOwnerSession() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== UserRole.BUSINESS_OWNER) {
    redirect("/me/bookings")
  }

  return session
}

export async function getBusinessCategories() {
  return prisma.businessCategory.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  })
}

export async function getBusinessesForOwner(ownerId: string) {
  return prisma.business.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { name: true },
      },
      _count: {
        select: {
          services: true,
          resources: true,
          bookings: true,
        },
      },
    },
  })
}

export async function getBusinessForOwner(businessId: string, ownerId: string) {
  return prisma.business.findFirst({
    where: {
      id: businessId,
      ownerId,
    },
    include: {
      category: true,
      _count: {
        select: {
          services: true,
          resources: true,
          bookings: true,
        },
      },
    },
  })
}
