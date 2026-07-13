import { BookingStatus } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

const customerBookingInclude = {
  business: { select: { name: true, timezone: true } },
  resource: { select: { name: true } },
  service: { select: { durationMinutes: true, name: true } },
}

export async function getBookingsForCustomer(customerId: string) {
  return prisma.booking.findMany({
    where: { customerId },
    orderBy: { startsAt: "asc" },
    include: customerBookingInclude,
  })
}

export async function getUpcomingBookingsForCustomer(customerId: string, now = new Date()) {
  return prisma.booking.findMany({
    where: {
      customerId,
      startsAt: { gte: now },
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    },
    orderBy: { startsAt: "asc" },
    include: customerBookingInclude,
  })
}

export async function getBookingHistoryForCustomer({
  customerId,
  now = new Date(),
  page,
  pageSize,
}: {
  customerId: string
  now?: Date
  page: number
  pageSize: number
}) {
  const where = {
    customerId,
    OR: [
      { startsAt: { lt: now } },
      { status: { notIn: [BookingStatus.PENDING, BookingStatus.CONFIRMED] } },
    ],
  }
  const total = await prisma.booking.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { startsAt: "desc" },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    include: customerBookingInclude,
  })

  return {
    bookings,
    page: safePage,
    pageSize,
    total,
    totalPages,
  }
}

export async function getBookingForCustomer(bookingId: string, customerId: string) {
  return prisma.booking.findFirst({
    where: { customerId, id: bookingId },
    include: {
      business: { select: { id: true, name: true, timezone: true } },
      service: { select: { name: true, durationMinutes: true } },
      resource: { select: { name: true } },
    },
  })
}

export async function getBookingsForBusinessOwner(businessId: string, ownerId: string) {
  return prisma.booking.findMany({
    where: {
      businessId,
      business: { ownerId },
    },
    orderBy: { startsAt: "asc" },
    include: {
      business: { select: { name: true, timezone: true } },
      customer: { select: { name: true, email: true } },
      service: { select: { name: true, durationMinutes: true } },
      resource: { select: { name: true } },
    },
  })
}
