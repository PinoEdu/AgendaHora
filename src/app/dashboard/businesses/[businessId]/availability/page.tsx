import Link from "next/link"
import { notFound } from "next/navigation"

import {
  DashboardHero,
  DashboardPanel,
  DashboardShell,
  dashboardCardClassName,
  dashboardPillClassName,
} from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { AvailabilityForm } from "@/features/availability/availability-form"
import { deleteAvailabilityRuleAction } from "@/features/availability/availability.actions"
import {
  formatDayOfWeek,
  minutesToTime,
} from "@/features/availability/availability-format"
import {
  getAvailabilityRulesForBusinessOwner,
  getResourcesForAvailabilityForm,
} from "@/features/availability/availability.queries"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { formatResourceType } from "@/features/resources/resource-format"

type AvailabilityPageProps = {
  params: Promise<{
    businessId: string
  }>
}

export default async function AvailabilityPage({ params }: AvailabilityPageProps) {
  const { businessId } = await params
  const session = await requireBusinessOwnerSession()
  const [business, resources, rules] = await Promise.all([
    getBusinessForOwner(businessId, session.user.id),
    getResourcesForAvailabilityForm(businessId, session.user.id),
    getAvailabilityRulesForBusinessOwner(businessId, session.user.id),
  ])

  if (!business) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHero
        actions={(
          <Button asChild className="border-white/20 bg-white/10 text-[#fffcf6] hover:bg-white/20" variant="outline">
            <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
          </Button>
        )}
        description="Configura ventanas semanales por recurso para que el motor genere horarios reservables."
        eyebrow={business.name}
        title="Disponibilidad semanal"
      />

      {resources.length === 0 ? (
        <EmptyState
          actionHref={`/dashboard/businesses/${business.id}/resources/new`}
          actionLabel="Crear recurso"
          className={`${dashboardCardClassName} p-5 text-left`}
          description="La disponibilidad se configura por recurso. Crea al menos un recurso activo antes de definir horarios semanales."
          eyebrow="Requisito"
          marker="--:--"
          title="Necesitas recursos activos"
        />
      ) : null}

      <AvailabilityForm businessId={business.id} resources={resources} />

      <DashboardPanel className="space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">Horarios configurados</h2>
        {rules.length === 0 ? (
          <EmptyState
            className={dashboardCardClassName}
            description="Agrega reglas semanales para que el motor genere slots disponibles en el flujo público de reserva."
            eyebrow="Disponibilidad"
            marker="0"
            title="Todavía no hay horarios"
          />
        ) : (
          <div className="grid gap-4">
            {rules.map((rule) => (
              <article key={rule.id} className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{rule.resource.name}</h3>
                      <span className={dashboardPillClassName}>{formatResourceType(rule.resource.type)}</span>
                      <span className={dashboardPillClassName}>{rule.isActive ? "Activa" : "Inactiva"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDayOfWeek(rule.dayOfWeek)} · {minutesToTime(rule.startMinute)} - {minutesToTime(rule.endMinute)}
                    </p>
                  </div>
                  <form action={deleteAvailabilityRuleAction}>
                    <input name="businessId" type="hidden" value={business.id} />
                    <input name="ruleId" type="hidden" value={rule.id} />
                    <Button size="sm" type="submit" variant="outline">
                      Eliminar
                    </Button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardPanel>
    </DashboardShell>
  )
}
