import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
import { getPublicBusinessBySlug } from "@/features/businesses/business-public.queries"

type BusinessProfilePageProps = {
  params: Promise<{
    slug: string
  }>
}

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

export default async function BusinessProfilePage({ params }: BusinessProfilePageProps) {
  const { slug } = await params
  const business = await getPublicBusinessBySlug(slug)

  if (!business) {
    notFound()
  }

  const canBook = business.services.length > 0 && business.resources.length > 0

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f8f5ef] text-[#1e1b16]">
      <CalendarGrid className="opacity-40 [mask-image:radial-gradient(circle_at_top_right,black,transparent_56%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm md:p-8">
          <CalendarGrid className="bg-[size:44px_44px] opacity-65" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <div className="space-y-4">
              <p className="w-fit rounded-full bg-[#fff0d2] px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#7b5d43]">
                {business.categoryName}
              </p>
              <div className="space-y-2">
                <h1 className="font-display max-w-3xl text-4xl font-semibold leading-none tracking-[-0.05em] sm:text-5xl">
                  {business.name}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[#655b4f]">
                  {business.description || "Reserva servicios de este negocio online con disponibilidad real."}
                </p>
              </div>
              {!canBook ? (
                <p className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] px-4 py-3 text-sm text-[#655b4f]">
                  Este negocio aún está configurando sus reservas.
                </p>
              ) : null}
            </div>

            <aside className="rounded-[1.75rem] border border-[#e6d8c5] bg-[#1e1b16] p-5 text-[#fffcf6] shadow-sm">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#f2c66d]">Datos del negocio</p>
                <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">Información</h2>
              </div>

              <dl className="mt-4 divide-y divide-white/15 rounded-2xl bg-white/10 text-sm">
                {[
                  ["Ciudad", business.city || "No especificada"],
                  ["Dirección", business.address || "No especificada"],
                  ["Teléfono", business.phone || "No especificado"],
                  ["Zona", business.timezone],
                ].map(([label, value]) => (
                  <div className="grid grid-cols-[4.75rem_1fr] gap-3 px-4 py-3" key={label}>
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
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-[-0.04em]">Precios claros antes de reservar</h2>
            </div>
            {canBook ? <p className="text-sm text-[#655b4f]">Elige un servicio y confirma el horario disponible.</p> : null}
          </div>

          {business.services.length === 0 ? (
            <EmptyState
              className="rounded-[1.75rem] border-[#e6d8c5] bg-[#fffcf6]"
              description="El negocio debe publicar al menos un servicio activo para que los clientes puedan iniciar una reserva."
              eyebrow="Servicios"
              marker="0"
              title="Este negocio aún no tiene servicios activos"
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
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.035em]">{service.name}</h3>
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
                    <p className="font-display mt-2 text-3xl font-semibold tracking-tight">{formatPrice(service.price)}</p>
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

      </div>
    </main>
  )
}
