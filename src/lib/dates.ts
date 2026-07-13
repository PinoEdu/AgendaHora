import { formatInTimeZone, fromZonedTime } from "date-fns-tz"

import { DayOfWeek } from "@/generated/prisma/enums"

export const MINUTES_IN_DAY = 24 * 60

export function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`
}

export function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB
}

export function addDaysToDateString(date: string, days: number) {
  const [year = "0", month = "1", day = "1"] = date.split("-")
  const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + days))

  return utcDate.toISOString().slice(0, 10)
}

export function getDayOfWeekForDate(date: string) {
  const [year = "0", month = "1", day = "1"] = date.split("-")
  const utcDay = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).getUTCDay()
  const dayOfWeekByUtcDay = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ]

  return dayOfWeekByUtcDay[utcDay]
}

export function localDateTimeToUtc(date: string, minutes: number, timezone: string) {
  return fromZonedTime(`${date}T${minutesToTime(minutes)}:00`, timezone)
}

export function getUtcRangeForLocalDate(date: string, timezone: string) {
  return {
    startsAt: localDateTimeToUtc(date, 0, timezone),
    endsAt: localDateTimeToUtc(addDaysToDateString(date, 1), 0, timezone),
  }
}

export function formatUtcTimeInTimezone(date: Date, timezone: string) {
  return formatInTimeZone(date, timezone, "HH:mm")
}

export function formatUtcDateTimeInTimezone(date: Date, timezone: string) {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd HH:mm")
}

export function formatUtcDateInTimezone(date: Date, timezone: string) {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd")
}

export function formatUtcDisplayDateInTimezone(date: Date, timezone: string) {
  return formatInTimeZone(date, timezone, "dd-MM-yyyy")
}

export function getMinuteOfDayInTimezone(date: Date, timezone: string) {
  const [hours = "0", minutes = "0"] = formatUtcTimeInTimezone(date, timezone).split(":")

  return Number(hours) * 60 + Number(minutes)
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}
