import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
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
      enabled: true,
    },
    {
      label: "Recursos",
      description: "Crea barberos, canchas, boxes o espacios.",
      metric: business._count.resources,
      href: `/dashboard/businesses/${business.id}/resources`,
      enabled: true,
    },
    {
      label: "Disponibilidad",
      description: "Configura horarios semanales.",
      metric: "Semanal",
      href: `/dashboard/businesses/${business.id}/availability`,
      enabled: true,
    },
    {
      label: "Bloqueos",
      description: "Bloquea feriados, vacaciones o mantenciones.",
      metric: "Manual",
      href: `/dashboard/businesses/${business.id}/blocked-times`,
      enabled: true,
    },
    {
      label: "Reservas",
      description: "Revisa reservas recibidas.",
      metric: business._count.bookings,
      href: `/dashboard/businesses/${business.id}/bookings`,
      enabled: true,
    },
  ]

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_right,#fde68a55,transparent_28%),linear-gradient(180deg,#f8fafc,#e2e8f0)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[#111827] p-6 text-white shadow-sm md:p-8">
        <CalendarGrid className="opacity-20" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Operación del negocio</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.045em]">{business.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Mantiene servicios, recursos, disponibilidad y reservas listos para operar online.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="border-white/20 bg-white/10 text-white hover:bg-white/20" variant="outline">
              <Link href="/dashboard/businesses">Volver</Link>
            </Button>
            <Button asChild className="bg-amber-300 text-slate-950 hover:bg-amber-200">
              <Link href={`/dashboard/businesses/${business.id}/edit`}>Editar</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Estado</p>
            <p className="font-display mt-2 text-2xl font-semibold tracking-tight">{formatBusinessStatus(business.status)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Servicios</p>
            <p className="font-display mt-2 text-2xl font-semibold tracking-tight">{business._count.services}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Recursos</p>
            <p className="font-display mt-2 text-2xl font-semibold tracking-tight">{business._count.resources}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Reservas</p>
            <p className="font-display mt-2 text-2xl font-semibold tracking-tight">{business._count.bookings}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">Informacion publica</h2>
        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Categoria</dt>
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
            <dt className="text-muted-foreground">Direccion</dt>
            <dd className="font-medium">{business.address || "Sin direccion"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Telefono</dt>
            <dd className="font-medium">{business.phone || "Sin telefono"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{business.email || "Sin email"}</dd>
          </div>
        </dl>
        {business.description ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{business.description}</p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {managementSections.map((section) => (
          <TicketCard className="border-slate-200 bg-white" key={section.label} contentClassName="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold">{section.label}</h3>
              <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {section.metric}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
            {section.enabled ? (
              <Button asChild className="w-full" variant="outline">
                <Link href={section.href}>Administrar</Link>
              </Button>
            ) : (
              <p className="mt-4 text-xs font-medium text-muted-foreground">Proxima fase</p>
            )}
          </TicketCard>
        ))}
      </section>
      </div>
    </main>
  )
}
