"use server"

import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

import { signIn, signOut } from "@/auth"
import { UserRole } from "@/generated/prisma/enums"

import { getSafeCallbackUrl } from "./auth-redirects"
import { registerUser, validateUserCredentials } from "./auth.service"
import type { AuthActionState } from "./auth.types"
import { loginSchema, registerSchema } from "./auth.validators"

const defaultLoginRedirectByRole = {
  [UserRole.CUSTOMER]: "/me/bookings",
  [UserRole.BUSINESS_OWNER]: "/dashboard",
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedInput = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    callbackUrl: formData.get("callbackUrl"),
  })

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? "Datos invalidos." }
  }

  const result = await registerUser(parsedInput.data)

  if (!result.ok) {
    return { error: result.error }
  }

  const params = new URLSearchParams({ registered: "1" })
  const callbackUrl = getSafeCallbackUrl(parsedInput.data.callbackUrl)

  if (callbackUrl) {
    params.set("callbackUrl", callbackUrl)
  }

  redirect(`/login?${params.toString()}`)
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedInput = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl"),
  })

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? "Datos invalidos." }
  }

  const user = await validateUserCredentials(parsedInput.data)

  if (!user) {
    return { error: "Email o password incorrectos." }
  }

  try {
    const callbackUrl = getSafeCallbackUrl(parsedInput.data.callbackUrl)

    await signIn("credentials", {
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      redirectTo: callbackUrl ?? defaultLoginRedirectByRole[user.role],
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o password incorrectos." }
    }

    throw error
  }

  return { success: "Sesion iniciada." }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" })
}
