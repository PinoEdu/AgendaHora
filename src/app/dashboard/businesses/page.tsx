import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  getBusinessesForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { formatBusinessStatus } from "@/features/businesses/business-format"

export default async function DashboardBusinessesPage() {
  const session = await requireBusinessOwnerSession()
  const businesses = await getBusinessesForOwner(session.user.id)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">Mis negocios</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard/businesses/new">Crear negocio</Link>
        </Button>
      </div>

      {businesses.length === 0 ? (
        <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Todavia no tienes negocios</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Crea tu primer negocio para configurar servicios, recursos y horarios de reserva.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/businesses/new">Crear mi primer negocio</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-4">
          {businesses.map((business) => (
            <article key={business.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {formatBusinessStatus(business.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {business.category.name} {business.city ? `en ${business.city}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{business._count.services} servicios</span>
                    <span>{business._count.resources} recursos</span>
                    <span>{business._count.bookings} reservas</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/businesses/${business.id}/edit`}>Editar</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/dashboard/businesses/${business.id}`}>Administrar</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
