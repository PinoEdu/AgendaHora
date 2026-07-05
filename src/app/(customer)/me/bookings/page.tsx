import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"

export default async function MyBookingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Mis reservas</p>
          <h1 className="text-3xl font-semibold tracking-tight">Hola, {session.user.name}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Aun no hay reservas</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Cuando el flujo publico de reserva este implementado, tus proximas reservas apareceran
          aqui.
        </p>
      </section>
    </main>
  )
}
