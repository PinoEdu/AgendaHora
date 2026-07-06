"use client"

import Link from "next/link"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"

import { withCallbackUrl } from "./auth-redirects"
import { loginAction } from "./auth.actions"
import type { AuthActionState } from "./auth.types"

const initialState: AuthActionState = {}

type LoginFormProps = {
  callbackUrl?: string | null
  registered?: boolean
}

export function LoginForm({ callbackUrl, registered = false }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const registerHref = withCallbackUrl("/register", callbackUrl)

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
      {callbackUrl ? <input name="callbackUrl" type="hidden" value={callbackUrl} /> : null}

      {registered ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Cuenta creada. Inicia sesion para continuar.
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
      </div>

      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? "Ingresando..." : "Ingresar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No tienes cuenta?{" "}
        <Link className="font-medium text-foreground underline-offset-4 hover:underline" href={registerHref}>
          Registrate
        </Link>
      </p>
    </form>
  )
}
