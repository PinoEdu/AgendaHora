import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getPublicBusinesses } from "@/features/businesses/business-public.queries"

export default async function BusinessesPage() {
  const businesses = await getPublicBusinesses()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Explorar
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Negocios disponibles</h1>
          <p className="max-w-2xl text-muted-foreground">
            Encuentra servicios locales y reserva online con disponibilidad real.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>

      {businesses.length === 0 ? (
        <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">No hay negocios activos todavia</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Cuando un dueno active su negocio, aparecera en este listado publico.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <article key={business.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{business.categoryName}</p>
                  <h2 className="mt-1 text-xl font-semibold">{business.name}</h2>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {business.description || "Negocio disponible para reservas online."}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {business.city ? <span>{business.city}</span> : null}
                  <span>{business.servicesCount} servicios</span>
                  <span>{business.resourcesCount} recursos</span>
                </div>
              </div>
              <Button asChild className="mt-5" variant="outline">
                <Link href={`/businesses/${business.slug}`}>Ver negocio</Link>
              </Button>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
