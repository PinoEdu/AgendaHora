import Link from "next/link"

import { RegisterForm } from "@/features/auth/register-form"

export default function RegisterPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <Link className="text-sm font-semibold tracking-tight" href="/">
            AgendaHora
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Crea tu cuenta</h1>
          <p className="text-sm text-muted-foreground">
            Parte como cliente o publica tu negocio para recibir reservas.
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  )
}
