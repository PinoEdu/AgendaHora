import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
import { LogoutButton } from "@/features/auth/logout-button"
import {
  getBusinessesForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { formatBusinessStatus } from "@/features/businesses/business-format"

export default async function DashboardPage() {
  const session = await requireBusinessOwnerSession()
  const businesses = await getBusinessesForOwner(session.user.id)
  const totalServices = businesses.reduce((total, business) => total + business._count.services, 0)
  const totalResources = businesses.reduce((total, business) => total + business._count.resources, 0)
  const totalBookings = businesses.reduce((total, business) => total + business._count.bookings, 0)
  const activeBusinesses = businesses.filter((business) => business.status === "ACTIVE").length

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="relative overflow-hidden rounded-[2rem] border bg-[#111827] p-6 text-white shadow-sm md:p-8">
        <CalendarGrid className="opacity-20" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Centro de operacion</p>
            <h1 className="font-display text-4xl font-semibold tracking-[-0.045em]">Hola, {session.user.name}</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Controla publicaciones, servicios, recursos y reservas desde un solo tablero.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="border-white/20 bg-white/10 text-white hover:bg-white/20" variant="outline">
              <Link href="/dashboard/businesses">Mis negocios</Link>
            </Button>
            <Button asChild className="bg-amber-300 text-slate-950 hover:bg-amber-200">
              <Link href="/dashboard/businesses/new">Crear negocio</Link>
            </Button>
            <LogoutButton />
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Negocios", businesses.length],
            ["Activos", activeBusinesses],
            ["Servicios", totalServices],
            ["Reservas", totalBookings],
          ].map(([label, value]) => (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4" key={label}>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{label}</p>
              <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <TicketCard>
          <p className="text-sm text-muted-foreground">Recursos configurados</p>
          <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{totalResources}</p>
          <p className="mt-2 text-xs text-muted-foreground">Profesionales, espacios o equipos disponibles.</p>
        </TicketCard>
        <TicketCard>
          <p className="text-sm text-muted-foreground">Reservas recibidas</p>
          <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{totalBookings}</p>
          <p className="mt-2 text-xs text-muted-foreground">Historial operativo de todos tus negocios.</p>
        </TicketCard>
        <TicketCard>
          <p className="text-sm text-muted-foreground">Siguiente accion</p>
          <p className="font-display mt-2 text-xl font-semibold tracking-[-0.025em]">Mantener agenda al dia</p>
          <Button asChild className="mt-4" size="sm" variant="outline">
            <Link href="/dashboard/businesses">Revisar negocios</Link>
          </Button>
        </TicketCard>
      </section>

      {businesses.length === 0 ? (
        <EmptyState
          actionHref="/dashboard/businesses/new"
          actionLabel="Crear negocio"
          description="El negocio partira como borrador. Despues agrega servicios, recursos y disponibilidad para publicarlo con reservas online."
          eyebrow="Operacion inicial"
          marker="0"
          title="Crea tu primer negocio"
        />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">Negocios recientes</h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/businesses">Ver todos</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {businesses.slice(0, 4).map((business) => (
              <TicketCard key={business.id} contentClassName="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{business.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {business.category.name} {business.city ? `en ${business.city}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {formatBusinessStatus(business.status)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span className="rounded-xl border bg-background px-3 py-2">{business._count.services} servicios</span>
                  <span className="rounded-xl border bg-background px-3 py-2">{business._count.resources} recursos</span>
                  <span className="rounded-xl border bg-background px-3 py-2">{business._count.bookings} reservas</span>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/dashboard/businesses/${business.id}`}>Abrir operacion</Link>
                </Button>
              </TicketCard>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
