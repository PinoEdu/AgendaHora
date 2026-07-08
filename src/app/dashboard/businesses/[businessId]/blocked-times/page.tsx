import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { BlockedTimeForm } from "@/features/blocked-times/blocked-time-form"
import { formatDateTime } from "@/features/blocked-times/blocked-time-format"
import {
  deleteBlockedTimeAction,
} from "@/features/blocked-times/blocked-time.actions"
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
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{business.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Bloqueos manuales</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
        </Button>
      </div>

      <BlockedTimeForm businessId={business.id} resources={resources} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bloqueos proximos</h2>
        {blockedTimes.length === 0 ? (
          <EmptyState
            description="Usa el formulario superior para bloquear feriados, vacaciones, mantenciones o pausas de un recurso especifico."
            eyebrow="Bloqueos"
            marker="0"
            title="No hay bloqueos proximos"
          />
        ) : (
          <div className="grid gap-4">
            {blockedTimes.map((blockedTime) => (
              <article key={blockedTime.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {blockedTime.resource ? blockedTime.resource.name : "Todo el negocio"}
                      </h3>
                      {blockedTime.resource ? (
                        <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                          {formatResourceType(blockedTime.resource.type)}
                        </span>
                      ) : null}
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
      </section>
    </main>
  )
}
