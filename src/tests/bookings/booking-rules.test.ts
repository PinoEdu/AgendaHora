import { describe, expect, it } from "vitest"

import { BookingStatus } from "@/generated/prisma/enums"
import { BOOKING_CONFLICT_STATUSES } from "@/features/bookings/booking.constants"
import { hasRangeConflict, isWithinAvailabilityWindow } from "@/features/bookings/booking-rules"

describe("isWithinAvailabilityWindow", () => {
  it("allows bookings fully inside an availability window", () => {
    expect(
      isWithinAvailabilityWindow(9 * 60, 9 * 60 + 30, [
        { startMinute: 9 * 60, endMinute: 18 * 60 },
      ]),
    ).toBe(true)
  })

  it("rejects bookings outside availability windows", () => {
    expect(
      isWithinAvailabilityWindow(8 * 60 + 45, 9 * 60 + 15, [
        { startMinute: 9 * 60, endMinute: 18 * 60 },
      ]),
    ).toBe(false)
  })

  it("allows bookings ending exactly at the window end", () => {
    expect(
      isWithinAvailabilityWindow(17 * 60 + 30, 18 * 60, [
        { startMinute: 9 * 60, endMinute: 18 * 60 },
      ]),
    ).toBe(true)
  })
})

describe("hasRangeConflict", () => {
  it("detects overlapping ranges", () => {
    expect(
      hasRangeConflict(new Date("2099-01-01T10:00:00.000Z"), new Date("2099-01-01T10:30:00.000Z"), [
        {
          startsAt: new Date("2099-01-01T10:15:00.000Z"),
          endsAt: new Date("2099-01-01T10:45:00.000Z"),
        },
      ]),
    ).toBe(true)
  })

  it("does not treat contiguous ranges as conflicts", () => {
    expect(
      hasRangeConflict(new Date("2099-01-01T10:00:00.000Z"), new Date("2099-01-01T10:30:00.000Z"), [
        {
          startsAt: new Date("2099-01-01T10:30:00.000Z"),
          endsAt: new Date("2099-01-01T11:00:00.000Z"),
        },
      ]),
    ).toBe(false)
  })
})

describe("BOOKING_CONFLICT_STATUSES", () => {
  it("only pending and confirmed bookings block new bookings", () => {
    expect(BOOKING_CONFLICT_STATUSES).toContain(BookingStatus.PENDING)
    expect(BOOKING_CONFLICT_STATUSES).toContain(BookingStatus.CONFIRMED)
    expect(BOOKING_CONFLICT_STATUSES).not.toContain(BookingStatus.CANCELLED_BY_CUSTOMER)
    expect(BOOKING_CONFLICT_STATUSES).not.toContain(BookingStatus.CANCELLED_BY_BUSINESS)
  })
})
