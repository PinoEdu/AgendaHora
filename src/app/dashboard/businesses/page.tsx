import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
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
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_right,#fde68a55,transparent_28%),linear-gradient(180deg,#f8fafc,#e2e8f0)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[#111827] p-6 text-white shadow-sm md:p-8">
        <CalendarGrid className="opacity-20" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Operacion</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.045em]">Mis negocios</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Revisa que locales estan publicados y que configuracion falta para recibir reservas.
            </p>
          </div>
          <Button asChild className="bg-amber-300 text-slate-950 hover:bg-amber-200">
            <Link href="/dashboard/businesses/new">Crear negocio</Link>
          </Button>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Total</p>
            <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{businesses.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Activos</p>
            <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{activeBusinesses}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Pendientes</p>
            <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{businesses.length - activeBusinesses}</p>
          </div>
        </div>
      </section>

      {businesses.length === 0 ? (
        <EmptyState
          actionHref="/dashboard/businesses/new"
          actionLabel="Crear mi primer negocio"
          className="border-slate-200 bg-white"
          description="Crea un negocio para configurar servicios, recursos, disponibilidad semanal y comenzar a recibir reservas."
          eyebrow="Mis negocios"
          marker="0"
          title="Todavia no tienes negocios"
        />
      ) : (
        <section className="grid gap-4">
          {businesses.map((business) => (
            <TicketCard className="border-slate-200 bg-white" key={business.id} contentClassName="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">{business.name}</h2>
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {formatBusinessStatus(business.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {business.category.name} {business.city ? `en ${business.city}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{business._count.services} servicios</span>
                    <span>{business._count.resources} recursos</span>
                    <span>{business._count.bookings} reservas</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/businesses/${business.id}/edit`}>Editar</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/dashboard/businesses/${business.id}`}>Administrar</Link>
                  </Button>
                </div>
            </TicketCard>
          ))}
        </section>
      )}
      </div>
    </main>
  )
}
