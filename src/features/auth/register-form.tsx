"use client"

import Link from "next/link"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { UserRole } from "@/generated/prisma/enums"

import { withCallbackUrl } from "./auth-redirects"
import { registerAction } from "./auth.actions"
import type { AuthActionState } from "./auth.types"

const initialState: AuthActionState = {}

type RegisterFormProps = {
  callbackUrl?: string | null
}

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(registerAction, initialState)
  const loginHref = withCallbackUrl("/login", callbackUrl)

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
      {callbackUrl ? <input name="callbackUrl" type="hidden" value={callbackUrl} /> : null}

      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="name">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
      </div>

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
          autoComplete="new-password"
          minLength={8}
          required
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Tipo de cuenta</legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors hover:bg-muted/60">
          <input
            className="mt-1"
            defaultChecked
            name="role"
            type="radio"
            value={UserRole.CUSTOMER}
          />
          <span>
            <span className="block font-medium">Cliente</span>
            <span className="text-muted-foreground">Reserva servicios en negocios locales.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors hover:bg-muted/60">
          <input className="mt-1" name="role" type="radio" value={UserRole.BUSINESS_OWNER} />
          <span>
            <span className="block font-medium">Dueño de negocio</span>
            <span className="text-muted-foreground">Publica servicios y recibe reservas online.</span>
          </span>
        </label>
      </fieldset>

      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ya tienes cuenta?{" "}
        <Link className="font-medium text-foreground underline-offset-4 hover:underline" href={loginHref}>
          Ingresa
        </Link>
      </p>
    </form>
  )
}
