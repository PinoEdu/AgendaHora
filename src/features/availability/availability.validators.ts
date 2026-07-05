import { z } from "zod"

import { DayOfWeek } from "@/generated/prisma/enums"

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Ingresa una hora valida.")

export function timeToMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":")

  return Number(hours) * 60 + Number(minutes)
}

export const availabilityRuleSchema = z
  .object({
    resourceId: z.string().min(1, "Selecciona un recurso."),
    dayOfWeek: z.enum([
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY,
    ]),
    startTime: timeSchema,
    endTime: timeSchema,
    isActive: z.coerce.boolean<boolean>().default(true),
  })
  .transform((value) => ({
    resourceId: value.resourceId,
    dayOfWeek: value.dayOfWeek,
    startMinute: timeToMinutes(value.startTime),
    endMinute: timeToMinutes(value.endTime),
    isActive: value.isActive,
  }))
  .refine((value) => value.startMinute < value.endMinute, {
    message: "La hora de inicio debe ser anterior a la hora de termino.",
    path: ["endTime"],
  })

export type AvailabilityRuleInput = z.infer<typeof availabilityRuleSchema>
