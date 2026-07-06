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
    <main className="min-h-svh bg-[#f8f5ef] text-[#1e1b16]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
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
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(200,90,46,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,90,46,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
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

            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
              {[
                ["Ciudad", business.city || "No especificada"],
                ["Direccion", business.address || "No especificada"],
                ["Telefono", business.phone || "No especificado"],
                ["Zona horaria", business.timezone],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[#e6d8c5] bg-[#fffcf6]/90 p-4">
                  <dt className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">{label}</dt>
                  <dd className="mt-2 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="space-y-4" id="servicios">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a7058]">Servicios</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Elige que quieres reservar</h2>
            </div>
            {canBook ? <p className="text-sm text-[#655b4f]">Precios y duraciones configuradas por el negocio.</p> : null}
          </div>

          {business.services.length === 0 ? (
            <p className="rounded-[1.75rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 text-sm text-[#655b4f]">
              Este negocio aun no tiene servicios activos.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {business.services.map((service) => (
                <article
                  key={service.id}
                  className="rounded-[1.75rem] border border-[#e6d8c5] bg-[#fffcf6] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{service.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#655b4f]">
                        {service.description || "Servicio disponible para reserva."}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#fff0d2] px-3 py-1 text-xs font-semibold text-[#7b5d43]">
                      {service.durationMinutes} min
                    </span>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-2xl font-semibold">${service.price} CLP</p>
                    {canBook ? (
                      <Button asChild className="bg-[#1e1b16] text-[#fffcf6] hover:bg-[#2d271f]">
                        <Link href={`/businesses/${business.slug}/book`}>Reservar</Link>
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a7058]">Equipo</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Profesionales y espacios</h2>
          </div>
          {business.resources.length === 0 ? (
            <p className="rounded-[1.75rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 text-sm text-[#655b4f]">
              Este negocio aun no tiene recursos activos.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {business.resources.map((resource) => (
                <article key={resource.id} className="rounded-[1.75rem] border border-[#e6d8c5] bg-[#fffcf6] p-5 shadow-sm">
                  <span className="rounded-full bg-[#fff0d2] px-3 py-1 text-xs font-semibold text-[#7b5d43]">
                    {formatResourceType(resource.type)}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold">{resource.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#655b4f]">
                    {resource.description || "Disponible para servicios compatibles."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
