import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { formatResourceType } from "@/features/resources/resource-format"
import { getResourcesForBusinessOwner } from "@/features/resources/resource.queries"

type ResourcesPageProps = {
  params: Promise<{
    businessId: string
  }>
}

export default async function ResourcesPage({ params }: ResourcesPageProps) {
  const { businessId } = await params
  const session = await requireBusinessOwnerSession()
  const [business, resources] = await Promise.all([
    getBusinessForOwner(businessId, session.user.id),
    getResourcesForBusinessOwner(businessId, session.user.id),
  ])

  if (!business) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{business.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Recursos</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/businesses/${business.id}/resources/new`}>Crear recurso</Link>
          </Button>
        </div>
      </div>

      {resources.length === 0 ? (
        <EmptyState
          actionHref={`/dashboard/businesses/${business.id}/resources/new`}
          actionLabel="Crear recurso"
          description="Crea profesionales, canchas, boxes, salas o equipos. Cada recurso debe asociarse a servicios y tener disponibilidad para recibir reservas."
          eyebrow="Recursos"
          marker="0"
          title="Todavia no hay recursos"
        />
      ) : (
        <section className="grid gap-4">
          {resources.map((resource) => (
            <article key={resource.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{resource.name}</h2>
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {resource.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatResourceType(resource.type)}</p>
                  <p className="text-xs text-muted-foreground">
                    Servicios: {resource.services.map(({ service }) => service.name).join(", ") || "Sin servicios"}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{resource._count.availabilityRules} reglas de horario</span>
                    <span>{resource._count.bookings} reservas</span>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/businesses/${business.id}/resources/${resource.id}/edit`}>
                    Editar
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
