import { z } from "zod"

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
)

const optionalResourceId = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional(),
)

const dateTimeLocalSchema = z
  .string()
  .min(1, "Ingresa fecha y hora.")
  .transform((value) => new Date(value))
  .refine((value) => !Number.isNaN(value.getTime()), "Ingresa una fecha valida.")

export const blockedTimeSchema = z
  .object({
    resourceId: optionalResourceId,
    startsAt: dateTimeLocalSchema,
    endsAt: dateTimeLocalSchema,
    reason: optionalText,
  })
  .refine((value) => value.startsAt < value.endsAt, {
    message: "La fecha de inicio debe ser anterior a la fecha de termino.",
    path: ["endsAt"],
  })
  .refine((value) => value.endsAt > new Date(), {
    message: "No puedes crear un bloqueo completamente en el pasado.",
    path: ["endsAt"],
  })

export type BlockedTimeInput = z.infer<typeof blockedTimeSchema>
