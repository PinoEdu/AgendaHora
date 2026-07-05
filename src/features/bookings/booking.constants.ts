import { BookingStatus } from "@/generated/prisma/enums"

export const DEFAULT_BOOKING_STATUS = BookingStatus.CONFIRMED

export const BOOKING_CONFLICT_STATUSES = [BookingStatus.PENDING, BookingStatus.CONFIRMED] as const
