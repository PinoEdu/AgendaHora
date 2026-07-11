import { z } from "zod"

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
)

export const createBookingSchema = z.object({
  businessId: z.string().min(1, "businessId es requerido."),
  serviceId: z.string().min(1, "serviceId es requerido."),
  resourceId: z.string().min(1, "resourceId es requerido."),
  startsAt: z
    .string()
    .datetime("startsAt debe ser una fecha ISO valida.")
    .transform((value) => new Date(value)),
  customerName: optionalText,
  customerEmail: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email("Ingresa un correo válido.").optional(),
  ),
  customerPhone: optionalText,
  notes: optionalText,
})

export type CreateBookingRequest = z.infer<typeof createBookingSchema>

export const rescheduleBookingSchema = z.object({
  startsAt: z
    .string()
    .datetime("startsAt debe ser una fecha ISO valida.")
    .transform((value) => new Date(value)),
})

export type RescheduleBookingRequest = z.infer<typeof rescheduleBookingSchema>

export const rescheduleAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date debe tener formato yyyy-MM-dd."),
})

export type RescheduleAvailabilityQuery = z.infer<typeof rescheduleAvailabilitySchema>
