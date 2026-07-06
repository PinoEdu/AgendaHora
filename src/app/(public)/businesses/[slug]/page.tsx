import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getPublicBusinessBySlug } from "@/features/businesses/business-public.queries"
import { formatResourceType } from "@/features/resources/resource-format"

type BusinessProfilePageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function BusinessProfilePage({ params }: BusinessProfilePageProps) {
  const { slug } = await params
  const business = await getPublicBusinessBySlug(slug)

  if (!business) {
    notFound()
  }

  const canBook = business.services.length > 0 && business.resources.length > 0

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-6 rounded-3xl border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{business.categoryName}</p>
            <h1 className="text-4xl font-semibold tracking-tight">{business.name}</h1>
            <p className="max-w-2xl text-muted-foreground">
              {business.description || "Reserva servicios de este negocio online."}
            </p>
          </div>
          {canBook ? (
            <Button asChild size="lg">
              <Link href={`/businesses/${business.slug}/book`}>Reservar ahora</Link>
            </Button>
          ) : (
            <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Este negocio aun esta configurando sus reservas.
            </p>
          )}
        </div>

        <dl className="grid gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Ciudad</dt>
            <dd className="font-medium">{business.city || "No especificada"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Direccion</dt>
            <dd className="font-medium">{business.address || "No especificada"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Telefono</dt>
            <dd className="font-medium">{business.phone || "No especificado"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Zona horaria</dt>
            <dd className="font-medium">{business.timezone}</dd>
          </div>
        </dl>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Servicios</h2>
        {business.services.length === 0 ? (
          <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            Este negocio aun no tiene servicios activos.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {business.services.map((service) => (
              <article key={service.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                <h3 className="text-lg font-semibold">{service.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {service.description || "Servicio disponible para reserva."}
                </p>
                <p className="mt-4 text-sm font-medium">
                  {service.durationMinutes} min · ${service.price} CLP
                </p>
                {canBook ? (
                  <Button asChild className="mt-5" variant="outline">
                    <Link href={`/businesses/${business.slug}/book`}>Reservar este servicio</Link>
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Recursos</h2>
        {business.resources.length === 0 ? (
          <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            Este negocio aun no tiene recursos activos.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {business.resources.map((resource) => (
              <article key={resource.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                <h3 className="font-semibold">{resource.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{formatResourceType(resource.type)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
