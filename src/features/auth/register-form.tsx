"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { UserRole } from "@/generated/prisma/enums"

import { withCallbackUrl } from "./auth-redirects"
import { registerAction } from "./auth.actions"
import type { AuthActionState } from "./auth.types"
import { getPasswordRuleStates } from "./password-rules"

const initialState: AuthActionState = {}

type RegisterFormProps = {
  callbackUrl?: string | null
}

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(registerAction, initialState)
  const [password, setPassword] = useState("")
  const loginHref = withCallbackUrl("/login", callbackUrl)
  const passwordRuleStates = getPasswordRuleStates(password)
  const pendingPasswordRules = passwordRuleStates.filter((rule) => !rule.isMet)
  const isPasswordValid = password.length > 0 && pendingPasswordRules.length === 0

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
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          placeholder="Ej: Maria Gonzalez"
          type="text"
          autoComplete="name"
          required
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          name="email"
          placeholder="correo@ejemplo.com"
          type="email"
          autoComplete="email"
          required
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Contraseña
        </label>
        <input
          aria-describedby="password-help password-rules"
          id="password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Crea una contraseña segura"
          type="password"
          autoComplete="new-password"
          minLength={8}
          pattern="(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}"
          required
          title="Debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial."
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
        <p id="password-help" className="text-xs leading-5 text-muted-foreground">
          Debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.
        </p>
        <div aria-live="polite" className="grid gap-2" id="password-rules">
          {pendingPasswordRules.map((rule) => (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-muted bg-muted/30 px-3 py-2 text-xs text-muted-foreground transition-colors" key={rule.id}>
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                {rule.label}
              </span>
              <span className="font-medium">Falta</span>
            </div>
          ))}
          {isPasswordValid ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
              Contraseña segura
            </div>
          ) : null}
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Tipo de cuenta</legend>
        <p className="text-sm text-muted-foreground">Elige cómo quieres usar AgendaHora.</p>
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
            <span className="text-muted-foreground">Reserva servicios, revisa tus horarios y cancela cuando corresponda.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors hover:bg-muted/60">
          <input className="mt-1" name="role" type="radio" value={UserRole.BUSINESS_OWNER} />
          <span>
            <span className="block font-medium">Dueño de negocio</span>
            <span className="text-muted-foreground">Publica tu negocio, configura disponibilidad y gestiona reservas.</span>
          </span>
        </label>
      </fieldset>

      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link className="font-medium text-foreground underline-offset-4 hover:underline" href={loginHref}>
          Iniciar sesión
        </Link>
      </p>
    </form>
  )
}
