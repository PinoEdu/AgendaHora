"use server"

import { redirect } from "next/navigation"

import { BusinessStatus, UserRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

import type { BusinessActionState } from "./business.types"
import { createUniqueBusinessSlug } from "./business.utils"
import { createBusinessSchema, updateBusinessSchema } from "./business.validators"

async function requireBusinessOwner() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== UserRole.BUSINESS_OWNER) {
    redirect("/me/bookings")
  }

  return session.user
}

export async function createBusinessAction(
  _previousState: BusinessActionState,
  formData: FormData,
): Promise<BusinessActionState> {
  const user = await requireBusinessOwner()
  const parsedInput = createBusinessSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    city: formData.get("city"),
    country: formData.get("country") || "CL",
    timezone: formData.get("timezone") || "America/Santiago",
  })

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? "Datos invalidos." }
  }

  const category = await prisma.businessCategory.findUnique({
    where: { id: parsedInput.data.categoryId },
    select: { id: true },
  })

  if (!category) {
    return { error: "La categoria seleccionada no existe." }
  }

  const slug = await createUniqueBusinessSlug(parsedInput.data.name)
  const business = await prisma.business.create({
    data: {
      ...parsedInput.data,
      slug,
      ownerId: user.id,
      status: BusinessStatus.DRAFT,
    },
  })

  redirect(`/dashboard/businesses/${business.id}`)
}

export async function updateBusinessAction(
  businessId: string,
  _previousState: BusinessActionState,
  formData: FormData,
): Promise<BusinessActionState> {
  const user = await requireBusinessOwner()
  const parsedInput = updateBusinessSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    city: formData.get("city"),
    country: formData.get("country") || "CL",
    timezone: formData.get("timezone") || "America/Santiago",
    status: formData.get("status"),
  })

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? "Datos invalidos." }
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerId: user.id },
    select: { id: true },
  })

  if (!business) {
    return { error: "No tienes permiso para editar este negocio." }
  }

  const category = await prisma.businessCategory.findUnique({
    where: { id: parsedInput.data.categoryId },
    select: { id: true },
  })

  if (!category) {
    return { error: "La categoria seleccionada no existe." }
  }

  const slug = await createUniqueBusinessSlug(parsedInput.data.name, businessId)

  await prisma.business.update({
    where: { id: businessId },
    data: {
      ...parsedInput.data,
      slug,
    },
  })

  redirect(`/dashboard/businesses/${businessId}`)
}
