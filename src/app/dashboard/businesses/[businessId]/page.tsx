import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
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
      href: `/dashboard/businesses/${business.id}/services`,
      enabled: true,
    },
    {
      label: "Recursos",
      description: "Crea barberos, canchas, boxes o espacios.",
      href: `/dashboard/businesses/${business.id}/resources`,
      enabled: true,
    },
    {
      label: "Disponibilidad",
      description: "Configura horarios semanales.",
      href: `/dashboard/businesses/${business.id}/availability`,
      enabled: true,
    },
    {
      label: "Bloqueos",
      description: "Bloquea feriados, vacaciones o mantenciones.",
      href: `/dashboard/businesses/${business.id}/blocked-times`,
      enabled: true,
    },
    {
      label: "Reservas",
      description: "Revisa reservas recibidas.",
      href: `/dashboard/businesses/${business.id}/bookings`,
      enabled: true,
    },
  ]

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Administracion del negocio</p>
          <h1 className="text-3xl font-semibold tracking-tight">{business.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/businesses">Volver</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/businesses/${business.id}/edit`}>Editar</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Estado</p>
          <p className="mt-2 text-2xl font-semibold">{formatBusinessStatus(business.status)}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Categoria</p>
          <p className="mt-2 text-2xl font-semibold">{business.category.name}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Zona horaria</p>
          <p className="mt-2 text-2xl font-semibold">{business.timezone}</p>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Informacion publica</h2>
        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
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
          <article key={section.label} className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold">{section.label}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
            {section.enabled ? (
              <Link
                className="mt-4 inline-block text-xs font-medium text-foreground underline-offset-4 hover:underline"
                href={section.href}
              >
                Administrar
              </Link>
            ) : (
              <p className="mt-4 text-xs font-medium text-muted-foreground">Proxima fase</p>
            )}
          </article>
        ))}
      </section>
    </main>
  )
}
