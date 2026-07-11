import Link from "next/link"
import { notFound } from "next/navigation"

import {
  DashboardHero,
  DashboardShell,
  dashboardCardClassName,
  dashboardPillClassName,
} from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
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
    <DashboardShell>
      <DashboardHero
        actions={(
          <>
            <Button asChild className="border-white/20 bg-white/10 text-[#fffcf6] hover:bg-white/20" variant="outline">
              <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
            </Button>
            <Button asChild className="bg-[#f2c66d] text-[#1e1b16] hover:bg-[#e7b84d]">
              <Link href={`/dashboard/businesses/${business.id}/resources/new`}>Crear recurso</Link>
            </Button>
          </>
        )}
        description="Organiza quién atiende, qué espacio se reserva o qué equipo bloquea disponibilidad."
        eyebrow={business.name}
        title="Recursos"
      />

      {resources.length === 0 ? (
        <EmptyState
          actionHref={`/dashboard/businesses/${business.id}/resources/new`}
          actionLabel="Crear recurso"
          className={dashboardCardClassName}
          description="Crea profesionales, canchas, boxes, salas o equipos. Cada recurso debe asociarse a servicios y tener disponibilidad para recibir reservas."
          eyebrow="Recursos"
          marker="0"
          title="Todavía no hay recursos"
        />
      ) : (
        <section className="grid gap-4">
          {resources.map((resource) => (
            <TicketCard className={dashboardCardClassName} key={resource.id} contentClassName="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">{resource.name}</h2>
                  <span className={dashboardPillClassName}>{resource.isActive ? "Activo" : "Inactivo"}</span>
                  <span className={dashboardPillClassName}>{formatResourceType(resource.type)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Servicios: {resource.services.map(({ service }) => service.name).join(", ") || "Sin servicios"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-[#655b4f]">
                  <span className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] px-3 py-2">{resource._count.availabilityRules} reglas de horario</span>
                  <span className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] px-3 py-2">{resource._count.bookings} reservas</span>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href={`/dashboard/businesses/${business.id}/resources/${resource.id}/edit`}>Editar</Link>
              </Button>
            </TicketCard>
          ))}
        </section>
      )}
    </DashboardShell>
  )
}
