import { z } from "zod"

import { BusinessStatus } from "@/generated/prisma/enums"

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
)

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre del negocio."),
  categoryId: z.string().min(1, "Selecciona una categoria."),
  description: optionalText,
  phone: optionalText,
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email("Ingresa un correo válido.").optional(),
  ),
  address: optionalText,
  city: optionalText,
  country: z.string().trim().min(2, "Ingresa un pais.").default("CL"),
  timezone: z.string().trim().min(1, "Ingresa una zona horaria.").default("America/Santiago"),
})

export const updateBusinessSchema = createBusinessSchema.extend({
  status: z.enum([BusinessStatus.DRAFT, BusinessStatus.ACTIVE, BusinessStatus.INACTIVE]),
})

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>
