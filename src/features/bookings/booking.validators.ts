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
