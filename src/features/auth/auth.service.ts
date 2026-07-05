import bcrypt from "bcrypt"

import { prisma } from "@/lib/prisma"

import type { LoginInput, RegisterInput } from "./auth.validators"

const PASSWORD_SALT_ROUNDS = 12

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
}

export async function validateUserCredentials(input: LoginInput) {
  const user = await getUserByEmail(input.email)

  if (!user?.passwordHash) {
    return null
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)

  if (!passwordMatches) {
    return null
  }

  return user
}

export async function registerUser(input: RegisterInput) {
  const normalizedEmail = input.email.toLowerCase()
  const existingUser = await getUserByEmail(normalizedEmail)

  if (existingUser) {
    return { ok: false as const, error: "Ya existe una cuenta con ese email." }
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: normalizedEmail,
      passwordHash,
      role: input.role,
    },
  })

  return { ok: true as const, user }
}
