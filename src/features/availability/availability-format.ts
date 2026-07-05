import { DayOfWeek } from "@/generated/prisma/enums"

export const dayOfWeekOptions = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
] as const

export function formatDayOfWeek(dayOfWeek: string) {
  const labels: Record<string, string> = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miercoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
    SATURDAY: "Sabado",
    SUNDAY: "Domingo",
  }

  return labels[dayOfWeek] ?? dayOfWeek
}

export function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`
}
