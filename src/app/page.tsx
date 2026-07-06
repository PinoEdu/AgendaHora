import Link from "next/link"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/features/auth/logout-button"
import { UserRole } from "@/generated/prisma/enums"

export default async function Home() {
  const session = await auth()
  const dashboardHref =
    session?.user.role === UserRole.BUSINESS_OWNER ? "/dashboard" : "/me/bookings"

  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              AgendaHora
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Reservas online para servicios locales.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Una plataforma multi-negocio para que barberias, canchas, dentistas,
              manicuristas y otros servicios puedan publicar horarios y recibir reservas sin
              conflictos de agenda.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {session?.user ? (
              <>
                <Button asChild size="lg">
                  <Link href="/businesses">Explorar negocios</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href={dashboardHref}>Ir a mi cuenta</Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/businesses">Explorar negocios</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/register">Crear cuenta</Link>
                </Button>
              </>
            )}
          </div>

          <div className="grid gap-3 pt-6 sm:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold">Multi-negocio</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Cada dueno configura servicios, recursos y horarios.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold">Roles desde el inicio</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Clientes y duenos de negocio tienen accesos separados.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold">Base para agenda</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                La siguiente fase agrega negocios, servicios y disponibilidad.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
