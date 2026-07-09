"use server"

import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { UserRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

import type { ServiceActionState } from "./service.types"
import { serviceSchema } from "./service.validators"

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

function parseServiceFormData(formData: FormData) {
  return serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
    isActive: formData.get("isActive") === "on",
  })
}

export async function createServiceAction(
  businessId: string,
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const authorization = await requireBusinessOwnerForBusiness(businessId)

  if (!authorization.ok) {
    return { error: authorization.error }
  }

  const parsedInput = parseServiceFormData(formData)

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? "Datos inválidos." }
  }

  await prisma.service.create({
    data: {
      businessId,
      name: parsedInput.data.name,
      description: parsedInput.data.description,
      durationMinutes: parsedInput.data.durationMinutes,
      price: parsedInput.data.price.toString(),
      isActive: parsedInput.data.isActive,
    },
  })

  redirect(`/dashboard/businesses/${businessId}/services`)
}

export async function updateServiceAction(
  businessId: string,
  serviceId: string,
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const authorization = await requireBusinessOwnerForBusiness(businessId)

  if (!authorization.ok) {
    return { error: authorization.error }
  }

  const parsedInput = parseServiceFormData(formData)

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? "Datos inválidos." }
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, business: { ownerId: authorization.userId } },
    select: { id: true },
  })

  if (!service) {
    return { error: "No tienes permiso para editar este servicio." }
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: parsedInput.data.name,
      description: parsedInput.data.description,
      durationMinutes: parsedInput.data.durationMinutes,
      price: parsedInput.data.price.toString(),
      isActive: parsedInput.data.isActive,
    },
  })

  redirect(`/dashboard/businesses/${businessId}/services`)
}
