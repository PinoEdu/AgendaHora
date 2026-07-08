import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
import { getPublicBusinessBySlug } from "@/features/businesses/business-public.queries"
import { formatResourceType } from "@/features/resources/resource-format"

type BusinessProfilePageProps = {
  params: Promise<{
    slug: string
  }>
}

type PublicBusiness = NonNullable<Awaited<ReturnType<typeof getPublicBusinessBySlug>>>

function formatPrice(price: string) {
  const amount = Number(price)

  if (!Number.isFinite(amount)) {
    return `$${price} CLP`
  }

  return new Intl.NumberFormat("es-CL", {
    currency: "CLP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount)
}

function getLowestServicePrice(services: PublicBusiness["services"]) {
  if (services.length === 0) {
    return null
  }

  return services.reduce((lowestPrice, service) => Math.min(lowestPrice, Number(service.price)), Number(services[0]?.price ?? 0))
}

function getShortestDuration(services: PublicBusiness["services"]) {
  if (services.length === 0) {
    return null
  }

  return services.reduce(
    (shortestDuration, service) => Math.min(shortestDuration, service.durationMinutes),
    services[0]?.durationMinutes ?? 0,
  )
}

function getCompatibleServiceNames(resource: PublicBusiness["resources"][number], services: PublicBusiness["services"]) {
  return services
    .filter((service) => resource.serviceIds.includes(service.id))
    .map((service) => service.name)
}

export default async function BusinessProfilePage({ params }: BusinessProfilePageProps) {
  const { slug } = await params
  const business = await getPublicBusinessBySlug(slug)

  if (!business) {
    notFound()
  }

  const canBook = business.services.length > 0 && business.resources.length > 0
  const lowestServicePrice = getLowestServicePrice(business.services)
  const shortestDuration = getShortestDuration(business.services)

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f8f5ef] text-[#1e1b16]">
      <CalendarGrid className="opacity-40 [mask-image:radial-gradient(circle_at_top_right,black,transparent_56%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Button asChild className="border-[#d6c7b5] bg-[#fffcf6]" variant="outline">
            <Link href="/businesses">Volver a negocios</Link>
          </Button>
          {canBook ? (
            <span className="rounded-full bg-[#c85a2e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Reserva online
            </span>
          ) : null}
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm md:p-8">
          <CalendarGrid className="bg-[size:44px_44px] opacity-80" />
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="space-y-5">
              <p className="w-fit rounded-full bg-[#fff0d2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7b5d43]">
                {business.categoryName}
              </p>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
                  {business.name}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[#655b4f]">
                  {business.description || "Reserva servicios de este negocio online con disponibilidad real."}
                </p>
              </div>
              {canBook ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="bg-[#c85a2e] text-white hover:bg-[#a94722]" size="lg">
                    <Link href={`/businesses/${business.slug}/book`}>Reservar ahora</Link>
                  </Button>
                  <Button asChild className="border-[#d6c7b5] bg-white" size="lg" variant="outline">
                    <Link href="#servicios">Ver servicios</Link>
                  </Button>
                </div>
              ) : (
                <p className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] px-4 py-3 text-sm text-[#655b4f]">
                  Este negocio aun esta configurando sus reservas.
                </p>
              )}
            </div>

            <aside className="rounded-[1.75rem] border border-[#e6d8c5] bg-[#1e1b16] p-5 text-[#fffcf6] shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f2c66d]">Ficha de reserva</p>
                  <h2 className="mt-3 text-2xl font-semibold">{business.name}</h2>
                </div>
                <span className="rounded-full bg-[#f2c66d] px-3 py-1 text-xs font-semibold text-[#1e1b16]">
                  {canBook ? "Online" : "Pronto"}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#d8cfc1]">Desde</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {lowestServicePrice === null ? "Pendiente" : formatPrice(String(lowestServicePrice))}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#d8cfc1]">Duracion</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {shortestDuration === null ? "Pendiente" : `${shortestDuration}+ min`}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#d8cfc1]">Servicios</p>
                  <p className="mt-2 text-2xl font-semibold">{business.services.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#d8cfc1]">Equipo</p>
                  <p className="mt-2 text-2xl font-semibold">{business.resources.length}</p>
                </div>
              </div>

              <dl className="mt-5 divide-y divide-white/15 rounded-2xl bg-white/10 text-sm">
                {[
                  ["Ciudad", business.city || "No especificada"],
                  ["Direccion", business.address || "No especificada"],
                  ["Telefono", business.phone || "No especificado"],
                  ["Zona", business.timezone],
                ].map(([label, value]) => (
                  <div className="grid grid-cols-[5.5rem_1fr] gap-3 px-4 py-3" key={label}>
                    <dt className="text-[#d8cfc1]">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>

        <section className="space-y-4" id="servicios">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a7058]">Menu de servicios</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Precios claros antes de reservar</h2>
            </div>
            {canBook ? <p className="text-sm text-[#655b4f]">Elige un servicio y confirma el horario disponible.</p> : null}
          </div>

          {business.services.length === 0 ? (
            <EmptyState
              className="rounded-[1.75rem] border-[#e6d8c5] bg-[#fffcf6]"
              description="El negocio debe publicar al menos un servicio activo para que los clientes puedan iniciar una reserva."
              eyebrow="Servicios"
              marker="0"
              title="Este negocio aun no tiene servicios activos"
            />
          ) : (
            <div className="grid gap-4">
              {business.services.map((service, index) => (
                <TicketCard key={service.id} contentClassName="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#fff0d2] px-3 py-1 text-xs font-semibold text-[#7b5d43]">
                        {service.durationMinutes} min
                      </span>
                      {index === 0 ? (
                        <span className="rounded-full bg-[#c85a2e] px-3 py-1 text-xs font-semibold text-white">
                          Destacado
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight">{service.name}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#655b4f]">
                        {service.description || "Servicio disponible para reserva."}
                      </p>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8a7058]">
                      {service.resourceIds.length} recurso{service.resourceIds.length === 1 ? "" : "s"} disponible
                      {service.resourceIds.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-[#e6d8c5] bg-[#fff8eb] p-4 text-left md:min-w-48 md:text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Precio</p>
                    <p className="mt-2 text-3xl font-semibold">{formatPrice(service.price)}</p>
                    {canBook ? (
                      <Button asChild className="mt-4 w-full bg-[#1e1b16] text-[#fffcf6] hover:bg-[#2d271f]">
                        <Link href={`/businesses/${business.slug}/book`}>Reservar este servicio</Link>
                      </Button>
                    ) : null}
                  </div>
                </TicketCard>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a7058]">Equipo disponible</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Profesionales y espacios</h2>
            </div>
            <p className="text-sm text-[#655b4f]">Cada recurso atiende solo servicios compatibles.</p>
          </div>
          {business.resources.length === 0 ? (
            <EmptyState
              className="rounded-[1.75rem] border-[#e6d8c5] bg-[#fffcf6]"
              description="Falta configurar quien o donde se prestan los servicios. Sin recursos activos no se pueden mostrar horarios."
              eyebrow="Equipo"
              marker="0"
              title="Este negocio aun no tiene recursos activos"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {business.resources.map((resource) => {
                const compatibleServiceNames = getCompatibleServiceNames(resource, business.services)

                return (
                  <TicketCard key={resource.id} contentClassName="space-y-5">
                    <div className="flex items-start gap-4">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-[#1e1b16] text-2xl font-semibold text-[#fffcf6]">
                        {resource.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <span className="rounded-full bg-[#fff0d2] px-3 py-1 text-xs font-semibold text-[#7b5d43]">
                          {formatResourceType(resource.type)}
                        </span>
                        <h3 className="mt-3 text-xl font-semibold">{resource.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#655b4f]">
                          {resource.description || "Disponible para servicios compatibles."}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a7058]">
                        Puede atender
                      </p>
                      {compatibleServiceNames.length === 0 ? (
                        <p className="mt-2 text-sm text-[#655b4f]">Sin servicios compatibles activos.</p>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {compatibleServiceNames.slice(0, 3).map((serviceName) => (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#655b4f]" key={serviceName}>
                              {serviceName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {canBook ? (
                      <Button asChild className="w-full border-[#d6c7b5] bg-white" variant="outline">
                        <Link href={`/businesses/${business.slug}/book`}>Ver horarios</Link>
                      </Button>
                    ) : null}
                  </TicketCard>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
