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
import { BlockedTimeForm } from "@/features/blocked-times/blocked-time-form"
import { formatDateTime } from "@/features/blocked-times/blocked-time-format"
import { deleteBlockedTimeAction } from "@/features/blocked-times/blocked-time.actions"
import {
  getBlockedTimesForBusinessOwner,
  getResourcesForBlockedTimeForm,
} from "@/features/blocked-times/blocked-time.queries"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { formatResourceType } from "@/features/resources/resource-format"

type BlockedTimesPageProps = {
  params: Promise<{
    businessId: string
  }>
}

export default async function BlockedTimesPage({ params }: BlockedTimesPageProps) {
  const { businessId } = await params
  const session = await requireBusinessOwnerSession()
  const [business, resources, blockedTimes] = await Promise.all([
    getBusinessForOwner(businessId, session.user.id),
    getResourcesForBlockedTimeForm(businessId, session.user.id),
    getBlockedTimesForBusinessOwner(businessId, session.user.id),
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
        description="Bloquea feriados, vacaciones, mantenciones o pausas para evitar reservas en horarios no operativos."
        eyebrow={business.name}
        title="Bloqueos manuales"
      />

      <BlockedTimeForm businessId={business.id} resources={resources} />

      <DashboardPanel className="space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">Bloqueos próximos</h2>
        {blockedTimes.length === 0 ? (
          <EmptyState
            className={dashboardCardClassName}
            description="Usa el formulario superior para bloquear feriados, vacaciones, mantenciones o pausas de un recurso específico."
            eyebrow="Bloqueos"
            marker="0"
            title="No hay bloqueos próximos"
          />
        ) : (
          <div className="grid gap-4">
            {blockedTimes.map((blockedTime) => (
              <article key={blockedTime.id} className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {blockedTime.resource ? blockedTime.resource.name : "Todo el negocio"}
                      </h3>
                      {blockedTime.resource ? <span className={dashboardPillClassName}>{formatResourceType(blockedTime.resource.type)}</span> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(blockedTime.startsAt)} - {formatDateTime(blockedTime.endsAt)}
                    </p>
                    {blockedTime.reason ? (
                      <p className="text-xs text-muted-foreground">Motivo: {blockedTime.reason}</p>
                    ) : null}
                  </div>
                  <form action={deleteBlockedTimeAction}>
                    <input name="businessId" type="hidden" value={business.id} />
                    <input name="blockedTimeId" type="hidden" value={blockedTime.id} />
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
