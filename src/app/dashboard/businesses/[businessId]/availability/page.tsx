import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { AvailabilityForm } from "@/features/availability/availability-form"
import {
  formatDayOfWeek,
  minutesToTime,
} from "@/features/availability/availability-format"
import {
  getAvailabilityRulesForBusinessOwner,
  getResourcesForAvailabilityForm,
} from "@/features/availability/availability.queries"
import { deleteAvailabilityRuleAction } from "@/features/availability/availability.actions"
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
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{business.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Disponibilidad semanal</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
        </Button>
      </div>

      {resources.length === 0 ? (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Necesitas recursos activos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea al menos un recurso activo antes de configurar horarios.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href={`/dashboard/businesses/${business.id}/resources/new`}>Crear recurso</Link>
          </Button>
        </section>
      ) : null}

      <AvailabilityForm businessId={business.id} resources={resources} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Horarios configurados</h2>
        {rules.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <h3 className="font-semibold">Todavia no hay horarios</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Agrega reglas semanales para que luego el motor pueda generar slots disponibles.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rules.map((rule) => (
              <article key={rule.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{rule.resource.name}</h3>
                      <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                        {formatResourceType(rule.resource.type)}
                      </span>
                      <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                        {rule.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDayOfWeek(rule.dayOfWeek)} · {minutesToTime(rule.startMinute)} -{" "}
                      {minutesToTime(rule.endMinute)}
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
      </section>
    </main>
  )
}
