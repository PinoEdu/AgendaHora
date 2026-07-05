import { describe, expect, it } from "vitest"

import { BookingStatus } from "@/generated/prisma/enums"
import { localDateTimeToUtc } from "@/lib/dates"
import { BLOCKING_BOOKING_STATUSES } from "@/features/availability/availability.constants"
import { buildAvailableSlotsForRules } from "@/features/availability/availability-slots"

const timezone = "America/Santiago"
const date = "2099-07-05"

describe("buildAvailableSlotsForRules", () => {
  it("generates slots inside availability rules", () => {
    const slots = buildAvailableSlotsForRules({
      date,
      timezone,
      durationMinutes: 30,
      rules: [{ startMinute: 9 * 60, endMinute: 10 * 60 }],
      now: new Date("2099-01-01T00:00:00.000Z"),
    })

    expect(slots.map((slot) => slot.localStartTime)).toEqual(["09:00", "09:15", "09:30"])
  })

  it("does not generate slots that exceed the rule end time", () => {
    const slots = buildAvailableSlotsForRules({
      date,
      timezone,
      durationMinutes: 30,
      rules: [{ startMinute: 9 * 60, endMinute: 10 * 60 }],
      now: new Date("2099-01-01T00:00:00.000Z"),
    })

    expect(slots.some((slot) => slot.localStartTime === "09:45")).toBe(false)
  })

  it("excludes slots that overlap conflicts", () => {
    const slots = buildAvailableSlotsForRules({
      date,
      timezone,
      durationMinutes: 30,
      rules: [{ startMinute: 9 * 60, endMinute: 10 * 60 }],
      conflicts: [
        {
          startsAt: localDateTimeToUtc(date, 9 * 60 + 15, timezone),
          endsAt: localDateTimeToUtc(date, 9 * 60 + 30, timezone),
        },
      ],
      now: new Date("2099-01-01T00:00:00.000Z"),
    })

    expect(slots.map((slot) => slot.localStartTime)).toEqual(["09:30"])
  })

  it("excludes slots in the past", () => {
    const slots = buildAvailableSlotsForRules({
      date,
      timezone,
      durationMinutes: 30,
      rules: [{ startMinute: 9 * 60, endMinute: 10 * 60 }],
      now: localDateTimeToUtc(date, 9 * 60 + 20, timezone),
    })

    expect(slots.map((slot) => slot.localStartTime)).toEqual(["09:30"])
  })

  it("formats returned slot times in the business timezone", () => {
    const [slot] = buildAvailableSlotsForRules({
      date,
      timezone,
      durationMinutes: 30,
      rules: [{ startMinute: 9 * 60, endMinute: 9 * 60 + 30 }],
      now: new Date("2099-01-01T00:00:00.000Z"),
    })

    expect(slot).toMatchObject({
      localStartTime: "09:00",
      localEndTime: "09:30",
    })
  })
})

describe("BLOCKING_BOOKING_STATUSES", () => {
  it("only treats pending and confirmed bookings as blocking", () => {
    expect(BLOCKING_BOOKING_STATUSES).toContain(BookingStatus.PENDING)
    expect(BLOCKING_BOOKING_STATUSES).toContain(BookingStatus.CONFIRMED)
    expect(BLOCKING_BOOKING_STATUSES).not.toContain(BookingStatus.CANCELLED_BY_CUSTOMER)
    expect(BLOCKING_BOOKING_STATUSES).not.toContain(BookingStatus.CANCELLED_BY_BUSINESS)
  })
})
