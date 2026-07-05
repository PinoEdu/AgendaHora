"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { UserRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

import type { AvailabilityActionState } from "./availability.types"
import { availabilityRuleSchema } from "./availability.validators"

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

function parseAvailabilityFormData(formData: FormData) {
  return availabilityRuleSchema.safeParse({
    resourceId: formData.get("resourceId"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    isActive: formData.get("isActive") === "on",
  })
}

export async function createAvailabilityRuleAction(
  businessId: string,
  _previousState: AvailabilityActionState,
  formData: FormData,
): Promise<AvailabilityActionState> {
  const authorization = await requireBusinessOwnerForBusiness(businessId)

  if (!authorization.ok) {
    return { error: authorization.error }
  }

  const parsedInput = parseAvailabilityFormData(formData)

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? "Datos invalidos." }
  }

  const resource = await prisma.bookableResource.findFirst({
    where: {
      id: parsedInput.data.resourceId,
      businessId,
      business: { ownerId: authorization.userId },
    },
    select: { id: true },
  })

  if (!resource) {
    return { error: "El recurso seleccionado no pertenece a este negocio." }
  }

  const overlappingRule = await prisma.availabilityRule.findFirst({
    where: {
      resourceId: parsedInput.data.resourceId,
      dayOfWeek: parsedInput.data.dayOfWeek,
      startMinute: { lt: parsedInput.data.endMinute },
      endMinute: { gt: parsedInput.data.startMinute },
    },
    select: { id: true },
  })

  if (overlappingRule) {
    return { error: "Ya existe una regla de disponibilidad que se solapa con ese horario." }
  }

  await prisma.availabilityRule.create({
    data: parsedInput.data,
  })

  revalidatePath(`/dashboard/businesses/${businessId}/availability`)

  return {}
}

export async function deleteAvailabilityRuleAction(formData: FormData) {
  const businessId = String(formData.get("businessId") ?? "")
  const ruleId = String(formData.get("ruleId") ?? "")
  const authorization = await requireBusinessOwnerForBusiness(businessId)

  if (!authorization.ok) {
    redirect("/dashboard")
  }

  const rule = await prisma.availabilityRule.findFirst({
    where: {
      id: ruleId,
      resource: {
        businessId,
        business: { ownerId: authorization.userId },
      },
    },
    select: { id: true },
  })

  if (rule) {
    await prisma.availabilityRule.delete({ where: { id: rule.id } })
  }

  revalidatePath(`/dashboard/businesses/${businessId}/availability`)
}
