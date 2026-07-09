import { z } from "zod"

import { UserRole } from "@/generated/prisma/enums"

import { passwordRules } from "./password-rules"

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
  callbackUrl: z
    .preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().optional(),
    ),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo."),
  email: z.string().trim().email("Ingresa un correo válido."),
  password: z.string().superRefine((password, context) => {
    for (const rule of passwordRules) {
      if (!rule.validate(password)) {
        context.addIssue({ code: "custom", message: rule.errorMessage })
      }
    }
  }),
  role: z.enum([UserRole.CUSTOMER, UserRole.BUSINESS_OWNER]),
  callbackUrl: z
    .preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().optional(),
    ),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
