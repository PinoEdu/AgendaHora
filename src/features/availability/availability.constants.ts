import { BookingStatus } from "@/generated/prisma/enums"

export const SLOT_INTERVAL_MINUTES = 15

export const BLOCKING_BOOKING_STATUSES = [BookingStatus.PENDING, BookingStatus.CONFIRMED] as const
