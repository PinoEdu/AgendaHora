import Link from "next/link"

import {
  DashboardHero,
  DashboardShell,
  dashboardCardClassName,
  dashboardMetricClassName,
  dashboardPillClassName,
} from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
import {
  getBusinessesForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { formatBusinessStatus } from "@/features/businesses/business-format"

export default async function DashboardBusinessesPage() {
  const session = await requireBusinessOwnerSession()
  const businesses = await getBusinessesForOwner(session.user.id)
  const activeBusinesses = businesses.filter((business) => business.status === "ACTIVE").length

  return (
    <DashboardShell>
      <DashboardHero
        actions={(
          <Button asChild className="bg-[#f2c66d] text-[#1e1b16] hover:bg-[#e7b84d]">
            <Link href="/dashboard/businesses/new">Crear negocio</Link>
          </Button>
        )}
        description="Revisa qué locales están publicados y qué configuración falta para recibir reservas."
        eyebrow="Operación"
        title="Mis negocios"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Total", businesses.length],
            ["Activos", activeBusinesses],
            ["Pendientes", businesses.length - activeBusinesses],
          ].map(([label, value]) => (
            <div className={dashboardMetricClassName} key={label}>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8cfc1]">{label}</p>
              <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </DashboardHero>

      {businesses.length === 0 ? (
        <EmptyState
          actionHref="/dashboard/businesses/new"
          actionLabel="Crear mi primer negocio"
          className={dashboardCardClassName}
          description="Crea un negocio para configurar servicios, recursos, disponibilidad semanal y comenzar a recibir reservas."
          eyebrow="Mis negocios"
          marker="0"
          title="Todavía no tienes negocios"
        />
      ) : (
        <section className="grid gap-4">
          {businesses.map((business) => (
            <TicketCard className={dashboardCardClassName} key={business.id} contentClassName="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">{business.name}</h2>
                  <span className={dashboardPillClassName}>{formatBusinessStatus(business.status)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {business.category.name} {business.city ? `en ${business.city}` : ""}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-[#655b4f]">
                  <span className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] px-3 py-2">{business._count.services} servicios</span>
                  <span className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] px-3 py-2">{business._count.resources} recursos</span>
                  <span className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] px-3 py-2">{business._count.bookings} reservas</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/businesses/${business.id}/edit`}>Editar</Link>
                </Button>
                <Button asChild className="bg-[#1e1b16] text-[#fffcf6] hover:bg-[#2d271f]">
                  <Link href={`/dashboard/businesses/${business.id}`}>Administrar</Link>
                </Button>
              </div>
            </TicketCard>
          ))}
        </section>
      )}
    </DashboardShell>
  )
}
