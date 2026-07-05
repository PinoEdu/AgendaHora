import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  getBusinessesForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { formatBusinessStatus } from "@/features/businesses/business-format"

export default async function DashboardPage() {
  const session = await requireBusinessOwnerSession()
  const businesses = await getBusinessesForOwner(session.user.id)
  const totalServices = businesses.reduce((total, business) => total + business._count.services, 0)
  const totalBookings = businesses.reduce((total, business) => total + business._count.bookings, 0)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Panel de negocio</p>
          <h1 className="text-3xl font-semibold tracking-tight">Hola, {session.user.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/businesses">Mis negocios</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/businesses/new">Crear negocio</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Negocios</p>
          <p className="mt-2 text-3xl font-semibold">{businesses.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Servicios configurados</p>
          <p className="mt-2 text-3xl font-semibold">{totalServices}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Reservas recibidas</p>
          <p className="mt-2 text-3xl font-semibold">{totalBookings}</p>
        </div>
      </section>

      {businesses.length === 0 ? (
        <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Crea tu primer negocio</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            El negocio partira como borrador. Luego podras agregar servicios, recursos y horarios
            antes de publicarlo.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/businesses/new">Crear negocio</Link>
          </Button>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Negocios recientes</h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/businesses">Ver todos</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {businesses.slice(0, 4).map((business) => (
              <article key={business.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{business.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {business.category.name} {business.city ? `en ${business.city}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {formatBusinessStatus(business.status)}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{business._count.resources} recursos</span>
                  <Link
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                    href={`/dashboard/businesses/${business.id}`}
                  >
                    Administrar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
