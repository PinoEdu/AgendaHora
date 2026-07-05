import { rangesOverlap } from "@/lib/dates"

import type { AvailabilityWindow } from "./booking.types"

export function isWithinAvailabilityWindow(
  startMinute: number,
  endMinute: number,
  windows: AvailabilityWindow[],
) {
  return windows.some((window) => startMinute >= window.startMinute && endMinute <= window.endMinute)
}

export function hasRangeConflict(
  startsAt: Date,
  endsAt: Date,
  conflicts: Array<{ startsAt: Date; endsAt: Date }>,
) {
  return conflicts.some((conflict) => rangesOverlap(startsAt, endsAt, conflict.startsAt, conflict.endsAt))
}
