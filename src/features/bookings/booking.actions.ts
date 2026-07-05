"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { BookingStatus, UserRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

import {
  canBusinessCancelBooking,
  canCustomerCancelBooking,
  canMarkBookingCompleted,
  canMarkBookingNoShow,
} from "./booking-rules"

async function requireAuthenticatedUser() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return session.user
}

async function requireBusinessOwnerUser() {
  const user = await requireAuthenticatedUser()

  if (user.role !== UserRole.BUSINESS_OWNER) {
    redirect("/me/bookings")
  }

  return user
}

export async function cancelBookingByCustomerAction(formData: FormData) {
  const user = await requireAuthenticatedUser()
  const bookingId = String(formData.get("bookingId") ?? "")
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: user.id },
    select: { id: true, status: true },
  })

  if (booking && canCustomerCancelBooking(booking.status)) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED_BY_CUSTOMER,
        cancelledAt: new Date(),
        cancellationReason: "Cancelada por el cliente",
      },
    })
  }

  revalidatePath("/me/bookings")
}

export async function cancelBookingByBusinessAction(formData: FormData) {
  const user = await requireBusinessOwnerUser()
  const businessId = String(formData.get("businessId") ?? "")
  const bookingId = String(formData.get("bookingId") ?? "")
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      businessId,
      business: { ownerId: user.id },
    },
    select: { id: true, status: true },
  })

  if (booking && canBusinessCancelBooking(booking.status)) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED_BY_BUSINESS,
        cancelledAt: new Date(),
        cancellationReason: "Cancelada por el negocio",
      },
    })
  }

  revalidatePath(`/dashboard/businesses/${businessId}/bookings`)
}

export async function markBookingCompletedAction(formData: FormData) {
  const user = await requireBusinessOwnerUser()
  const businessId = String(formData.get("businessId") ?? "")
  const bookingId = String(formData.get("bookingId") ?? "")
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      businessId,
      business: { ownerId: user.id },
    },
    select: { id: true, status: true },
  })

  if (booking && canMarkBookingCompleted(booking.status)) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.COMPLETED },
    })
  }

  revalidatePath(`/dashboard/businesses/${businessId}/bookings`)
}

export async function markBookingNoShowAction(formData: FormData) {
  const user = await requireBusinessOwnerUser()
  const businessId = String(formData.get("businessId") ?? "")
  const bookingId = String(formData.get("bookingId") ?? "")
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      businessId,
      business: { ownerId: user.id },
    },
    select: { id: true, status: true },
  })

  if (booking && canMarkBookingNoShow(booking.status)) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.NO_SHOW },
    })
  }

  revalidatePath(`/dashboard/businesses/${businessId}/bookings`)
}
