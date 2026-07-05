import { z } from "zod"

import { UserRole } from "@/generated/prisma/enums"

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un email valido."),
  password: z.string().min(1, "Ingresa tu password."),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre."),
  email: z.string().trim().email("Ingresa un email valido."),
  password: z.string().min(8, "La password debe tener al menos 8 caracteres."),
  role: z.enum([UserRole.CUSTOMER, UserRole.BUSINESS_OWNER]),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
