import { z } from "zod"

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
)

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre del servicio."),
  description: optionalText,
  durationMinutes: z.coerce
    .number<number>()
    .int("La duración debe ser un número entero.")
    .positive("La duración debe ser mayor a 0."),
  price: z.coerce.number<number>().min(0, "El precio debe ser mayor o igual a 0."),
  isActive: z.coerce.boolean<boolean>().default(true),
})

export type ServiceInput = z.infer<typeof serviceSchema>
