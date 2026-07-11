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
import { getServicesForBusinessOwner } from "@/features/services/service.queries"

type ServicesPageProps = {
  params: Promise<{
    businessId: string
  }>
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { businessId } = await params
  const session = await requireBusinessOwnerSession()
  const [business, services] = await Promise.all([
    getBusinessForOwner(businessId, session.user.id),
    getServicesForBusinessOwner(businessId, session.user.id),
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
              <Link href={`/dashboard/businesses/${business.id}/services/new`}>Crear servicio</Link>
            </Button>
          </>
        )}
        description="Define qué puede reservar un cliente y cuánto dura cada atención."
        eyebrow={business.name}
        title="Servicios"
      />

      {services.length === 0 ? (
        <EmptyState
          actionHref={`/dashboard/businesses/${business.id}/services/new`}
          actionLabel="Crear servicio"
          className={dashboardCardClassName}
          description="Agrega servicios reservables como corte de pelo, consulta dental o arriendo de cancha. Luego asócialos a recursos para habilitar horarios."
          eyebrow="Servicios"
          marker="0"
          title="Todavía no hay servicios"
        />
      ) : (
        <section className="grid gap-4">
          {services.map((service) => (
            <TicketCard className={dashboardCardClassName} key={service.id} contentClassName="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">{service.name}</h2>
                  <span className={dashboardPillClassName}>{service.isActive ? "Activo" : "Inactivo"}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {service.durationMinutes} min · ${service.price.toString()} CLP
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-[#655b4f]">
                  <span className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] px-3 py-2">{service._count.resources} recursos asociados</span>
                  <span className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] px-3 py-2">{service._count.bookings} reservas</span>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href={`/dashboard/businesses/${business.id}/services/${service.id}/edit`}>Editar</Link>
              </Button>
            </TicketCard>
          ))}
        </section>
      )}
    </DashboardShell>
  )
}
