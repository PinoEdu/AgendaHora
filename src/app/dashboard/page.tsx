import Link from "next/link"

import {
  DashboardHero,
  DashboardShell,
  dashboardCardClassName,
  dashboardMetricClassName,
} from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
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
    <DashboardShell>
      <DashboardHero
        actions={(
          <>
            <Button asChild className="border-white/20 bg-white/10 text-[#fffcf6] hover:bg-white/20" variant="outline">
              <Link href="/dashboard/businesses">Mis negocios</Link>
            </Button>
            <Button asChild className="bg-[#f2c66d] text-[#1e1b16] hover:bg-[#e7b84d]">
              <Link href="/dashboard/businesses/new">Crear negocio</Link>
            </Button>
            <LogoutButton className="border-white/20 bg-white/10 text-[#fffcf6] hover:bg-white/20" />
          </>
        )}
        description="Controla publicaciones, servicios, recursos y reservas desde un solo tablero."
        eyebrow="Centro de operación"
        title={`Hola, ${session.user.name}`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Negocios", businesses.length],
            ["Activos", activeBusinesses],
            ["Servicios", totalServices],
            ["Reservas", totalBookings],
          ].map(([label, value]) => (
            <div className={dashboardMetricClassName} key={label}>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8cfc1]">{label}</p>
              <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </DashboardHero>

      <section className="grid gap-4 md:grid-cols-3">
        <TicketCard className={dashboardCardClassName}>
          <p className="text-sm text-muted-foreground">Recursos configurados</p>
          <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{totalResources}</p>
          <p className="mt-2 text-xs text-muted-foreground">Profesionales, espacios o equipos disponibles.</p>
        </TicketCard>
        <TicketCard className={dashboardCardClassName}>
          <p className="text-sm text-muted-foreground">Reservas recibidas</p>
          <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{totalBookings}</p>
          <p className="mt-2 text-xs text-muted-foreground">Historial operativo de todos tus negocios.</p>
        </TicketCard>
        <TicketCard className={dashboardCardClassName}>
          <p className="text-sm text-muted-foreground">Siguiente acción</p>
          <p className="font-display mt-2 text-xl font-semibold tracking-[-0.025em]">Mantener agenda al día</p>
          <Button asChild className="mt-4" size="sm" variant="outline">
            <Link href="/dashboard/businesses">Revisar negocios</Link>
          </Button>
        </TicketCard>
      </section>

      {businesses.length === 0 ? (
        <EmptyState
          actionHref="/dashboard/businesses/new"
          actionLabel="Crear negocio"
          className={dashboardCardClassName}
          description="El negocio partirá como borrador. Después agrega servicios, recursos y disponibilidad para publicarlo con reservas online."
          eyebrow="Operación inicial"
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
              <TicketCard className={dashboardCardClassName} key={business.id} contentClassName="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{business.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {business.category.name} {business.city ? `en ${business.city}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#e6d8c5] bg-[#fff8eb] px-2.5 py-1 text-xs font-medium text-[#655b4f]">
                    {formatBusinessStatus(business.status)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-[#655b4f]">
                  <span className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] px-3 py-2">{business._count.services} servicios</span>
                  <span className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] px-3 py-2">{business._count.resources} recursos</span>
                  <span className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] px-3 py-2">{business._count.bookings} reservas</span>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/dashboard/businesses/${business.id}`}>Abrir operación</Link>
                </Button>
              </TicketCard>
            ))}
          </div>
        </section>
      )}
    </DashboardShell>
  )
}
