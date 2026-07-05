import {
  formatUtcTimeInTimezone,
  localDateTimeToUtc,
  rangesOverlap,
} from "@/lib/dates"

import { SLOT_INTERVAL_MINUTES } from "./availability.constants"
import type { AvailableSlot, TimeRange } from "./availability.types"

type AvailabilityRuleWindow = {
  startMinute: number
  endMinute: number
}

type BuildAvailableSlotsInput = {
  date: string
  timezone: string
  durationMinutes: number
  rules: AvailabilityRuleWindow[]
  conflicts?: TimeRange[]
  now?: Date
}

export function buildAvailableSlotsForRules(input: BuildAvailableSlotsInput): AvailableSlot[] {
  const now = input.now ?? new Date()
  const conflicts = input.conflicts ?? []
  const slots: AvailableSlot[] = []

  for (const rule of input.rules) {
    for (
      let startMinute = rule.startMinute;
      startMinute + input.durationMinutes <= rule.endMinute;
      startMinute += SLOT_INTERVAL_MINUTES
    ) {
      const endMinute = startMinute + input.durationMinutes
      const startsAt = localDateTimeToUtc(input.date, startMinute, input.timezone)
      const endsAt = localDateTimeToUtc(input.date, endMinute, input.timezone)

      if (startsAt <= now) {
        continue
      }

      const hasConflict = conflicts.some((conflict) =>
        rangesOverlap(startsAt, endsAt, conflict.startsAt, conflict.endsAt),
      )

      if (hasConflict) {
        continue
      }

      slots.push({
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        localStartTime: formatUtcTimeInTimezone(startsAt, input.timezone),
        localEndTime: formatUtcTimeInTimezone(endsAt, input.timezone),
      })
    }
  }

  return slots.sort((slotA, slotB) => slotA.startsAt.localeCompare(slotB.startsAt))
}
