import Link from "next/link"
import { notFound } from "next/navigation"

import {
  DashboardHero,
  DashboardPanel,
  DashboardShell,
  dashboardCardClassName,
  dashboardMetricClassName,
  dashboardPillClassName,
} from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { TicketCard } from "@/components/ui/ticket-card"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { formatBusinessStatus } from "@/features/businesses/business-format"

type BusinessAdminPageProps = {
  params: Promise<{
    businessId: string
  }>
}

export default async function BusinessAdminPage({ params }: BusinessAdminPageProps) {
  const { businessId } = await params
  const session = await requireBusinessOwnerSession()
  const business = await getBusinessForOwner(businessId, session.user.id)

  if (!business) {
    notFound()
  }

  const managementSections = [
    {
      label: "Servicios",
      description: "Define lo que se puede reservar.",
      metric: business._count.services,
      href: `/dashboard/businesses/${business.id}/services`,
    },
    {
      label: "Recursos",
      description: "Crea barberos, canchas, boxes o espacios.",
      metric: business._count.resources,
      href: `/dashboard/businesses/${business.id}/resources`,
    },
    {
      label: "Disponibilidad",
      description: "Configura horarios semanales.",
      metric: "Semanal",
      href: `/dashboard/businesses/${business.id}/availability`,
    },
    {
      label: "Bloqueos",
      description: "Bloquea feriados, vacaciones o mantenciones.",
      metric: "Manual",
      href: `/dashboard/businesses/${business.id}/blocked-times`,
    },
    {
      label: "Reservas",
      description: "Revisa reservas recibidas.",
      metric: business._count.bookings,
      href: `/dashboard/businesses/${business.id}/bookings`,
    },
  ]

  return (
    <DashboardShell>
      <DashboardHero
        actions={(
          <>
            <Button asChild className="border-white/20 bg-white/10 text-[#fffcf6] hover:bg-white/20" variant="outline">
              <Link href="/dashboard/businesses">Volver</Link>
            </Button>
            <Button asChild className="bg-[#f2c66d] text-[#1e1b16] hover:bg-[#e7b84d]">
              <Link href={`/dashboard/businesses/${business.id}/edit`}>Editar</Link>
            </Button>
          </>
        )}
        description="Mantén servicios, recursos, disponibilidad y reservas listos para operar online."
        eyebrow="Operación del negocio"
        title={business.name}
      >
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["Estado", formatBusinessStatus(business.status)],
            ["Servicios", business._count.services],
            ["Recursos", business._count.resources],
            ["Reservas", business._count.bookings],
          ].map(([label, value]) => (
            <div className={dashboardMetricClassName} key={label}>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8cfc1]">{label}</p>
              <p className="font-display mt-2 text-2xl font-semibold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </DashboardHero>

      <DashboardPanel>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">Información pública</h2>
        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Categoría</dt>
            <dd className="font-medium">{business.category.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Zona horaria</dt>
            <dd className="font-medium">{business.timezone}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Ciudad</dt>
            <dd className="font-medium">{business.city || "Sin ciudad"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Dirección</dt>
            <dd className="font-medium">{business.address || "Sin dirección"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Teléfono</dt>
            <dd className="font-medium">{business.phone || "Sin teléfono"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Correo</dt>
            <dd className="font-medium">{business.email || "Sin correo"}</dd>
          </div>
        </dl>
        {business.description ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{business.description}</p>
        ) : null}
      </DashboardPanel>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {managementSections.map((section) => (
          <TicketCard className={dashboardCardClassName} key={section.label} contentClassName="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold">{section.label}</h3>
              <span className={dashboardPillClassName}>{section.metric}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
            <Button asChild className="w-full" variant="outline">
              <Link href={section.href}>Administrar</Link>
            </Button>
          </TicketCard>
        ))}
      </section>
    </DashboardShell>
  )
}
