import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { getServicesForBusinessOwner } from "@/features/services/service.queries"

type ServicesPageProps = {
  params: Promise<{
    businessId: string
  }>
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { businessId } = await params
  const session = await requireBusinessOwnerSession()
  const [business, services] = await Promise.all([
    getBusinessForOwner(businessId, session.user.id),
    getServicesForBusinessOwner(businessId, session.user.id),
  ])

  if (!business) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{business.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Servicios</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/businesses/${business.id}/services/new`}>Crear servicio</Link>
          </Button>
        </div>
      </div>

      {services.length === 0 ? (
        <EmptyState
          actionHref={`/dashboard/businesses/${business.id}/services/new`}
          actionLabel="Crear servicio"
          description="Agrega servicios reservables como corte de pelo, consulta dental o arriendo de cancha. Luego asócialos a recursos para habilitar horarios."
          eyebrow="Servicios"
          marker="0"
          title="Todavia no hay servicios"
        />
      ) : (
        <section className="grid gap-4">
          {services.map((service) => (
            <article key={service.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{service.name}</h2>
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {service.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {service.durationMinutes} min · ${service.price.toString()} CLP
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{service._count.resources} recursos asociados</span>
                    <span>{service._count.bookings} reservas</span>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/businesses/${business.id}/services/${service.id}/edit`}>
                    Editar
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
