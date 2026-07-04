export const MINUTES_IN_DAY = 24 * 60

export function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`
}

export function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB
}
