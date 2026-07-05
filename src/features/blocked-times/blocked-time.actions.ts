"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { UserRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

import type { BlockedTimeActionState } from "./blocked-time.types"
import { blockedTimeSchema } from "./blocked-time.validators"

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

function parseBlockedTimeFormData(formData: FormData) {
  return blockedTimeSchema.safeParse({
    resourceId: formData.get("resourceId"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    reason: formData.get("reason"),
  })
}

export async function createBlockedTimeAction(
  businessId: string,
  _previousState: BlockedTimeActionState,
  formData: FormData,
): Promise<BlockedTimeActionState> {
  const authorization = await requireBusinessOwnerForBusiness(businessId)

  if (!authorization.ok) {
    return { error: authorization.error }
  }

  const parsedInput = parseBlockedTimeFormData(formData)

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? "Datos invalidos." }
  }

  if (parsedInput.data.resourceId) {
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
  }

  await prisma.blockedTime.create({
    data: {
      businessId,
      resourceId: parsedInput.data.resourceId,
      startsAt: parsedInput.data.startsAt,
      endsAt: parsedInput.data.endsAt,
      reason: parsedInput.data.reason,
    },
  })

  revalidatePath(`/dashboard/businesses/${businessId}/blocked-times`)

  return {}
}

export async function deleteBlockedTimeAction(formData: FormData) {
  const businessId = String(formData.get("businessId") ?? "")
  const blockedTimeId = String(formData.get("blockedTimeId") ?? "")
  const authorization = await requireBusinessOwnerForBusiness(businessId)

  if (!authorization.ok) {
    redirect("/dashboard")
  }

  const blockedTime = await prisma.blockedTime.findFirst({
    where: {
      id: blockedTimeId,
      businessId,
      business: { ownerId: authorization.userId },
    },
    select: { id: true },
  })

  if (blockedTime) {
    await prisma.blockedTime.delete({ where: { id: blockedTime.id } })
  }

  revalidatePath(`/dashboard/businesses/${businessId}/blocked-times`)
}
