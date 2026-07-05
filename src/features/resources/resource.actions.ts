"use server"

import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { UserRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

import type { ResourceActionState } from "./resource.types"
import { resourceSchema } from "./resource.validators"

async function requireBusinessOwnerForBusiness(businessId: string) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== UserRole.BUSINESS_OWNER) {
    redirect("/me/bookings")
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerId: session.user.id },
    select: { id: true },
  })

  if (!business) {
    return { ok: false as const, error: "No tienes permiso para administrar este negocio." }
  }

  return { ok: true as const, userId: session.user.id }
}

async function validateServicesBelongToBusiness(businessId: string, serviceIds: string[]) {
  const uniqueServiceIds = Array.from(new Set(serviceIds))

  if (uniqueServiceIds.length === 0) {
    return { ok: true as const, serviceIds: uniqueServiceIds }
  }

  const services = await prisma.service.findMany({
    where: {
      id: { in: uniqueServiceIds },
      businessId,
    },
    select: { id: true },
  })

  if (services.length !== uniqueServiceIds.length) {
    return { ok: false as const, error: "Uno o mas servicios seleccionados no pertenecen al negocio." }
  }

  return { ok: true as const, serviceIds: uniqueServiceIds }
}

function parseResourceFormData(formData: FormData) {
  return resourceSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    description: formData.get("description"),
    isActive: formData.get("isActive") === "on",
    serviceIds: formData.getAll("serviceIds"),
  })
}

export async function createResourceAction(
  businessId: string,
  _previousState: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  const authorization = await requireBusinessOwnerForBusiness(businessId)

  if (!authorization.ok) {
    return { error: authorization.error }
  }

  const parsedInput = parseResourceFormData(formData)

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? "Datos invalidos." }
  }

  const serviceValidation = await validateServicesBelongToBusiness(
    businessId,
    parsedInput.data.serviceIds,
  )

  if (!serviceValidation.ok) {
    return { error: serviceValidation.error }
  }

  await prisma.bookableResource.create({
    data: {
      businessId,
      name: parsedInput.data.name,
      type: parsedInput.data.type,
      description: parsedInput.data.description,
      isActive: parsedInput.data.isActive,
      services: {
        create: serviceValidation.serviceIds.map((serviceId) => ({ serviceId })),
      },
    },
  })

  redirect(`/dashboard/businesses/${businessId}/resources`)
}

export async function updateResourceAction(
  businessId: string,
  resourceId: string,
  _previousState: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  const authorization = await requireBusinessOwnerForBusiness(businessId)

  if (!authorization.ok) {
    return { error: authorization.error }
  }

  const parsedInput = parseResourceFormData(formData)

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? "Datos invalidos." }
  }

  const resource = await prisma.bookableResource.findFirst({
    where: { id: resourceId, businessId, business: { ownerId: authorization.userId } },
    select: { id: true },
  })

  if (!resource) {
    return { error: "No tienes permiso para editar este recurso." }
  }

  const serviceValidation = await validateServicesBelongToBusiness(
    businessId,
    parsedInput.data.serviceIds,
  )

  if (!serviceValidation.ok) {
    return { error: serviceValidation.error }
  }

  await prisma.$transaction([
    prisma.resourceService.deleteMany({ where: { resourceId } }),
    prisma.bookableResource.update({
      where: { id: resourceId },
      data: {
        name: parsedInput.data.name,
        type: parsedInput.data.type,
        description: parsedInput.data.description,
        isActive: parsedInput.data.isActive,
        services: {
          create: serviceValidation.serviceIds.map((serviceId) => ({ serviceId })),
        },
      },
    }),
  ])

  redirect(`/dashboard/businesses/${businessId}/resources`)
}
