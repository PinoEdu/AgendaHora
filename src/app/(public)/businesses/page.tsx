import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getPublicBusinesses } from "@/features/businesses/business-public.queries"

export default async function BusinessesPage() {
  const businesses = await getPublicBusinesses()
  const bookableBusinessesCount = businesses.filter((business) => business.canBook).length

  return (
    <main className="min-h-svh bg-[#f8f5ef] text-[#1e1b16]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-6 rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a7058]">
                Explorar
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Encuentra un horario, no solo un negocio.
              </h1>
              <p className="max-w-2xl text-[#655b4f]">
                Revisa negocios locales activos, compara servicios y entra directo al flujo de reserva cuando tengan disponibilidad configurada.
              </p>
            </div>
            <Button asChild className="border-[#d6c7b5] bg-white" variant="outline">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Activos</p>
              <p className="mt-2 text-2xl font-semibold">{businesses.length}</p>
            </div>
            <div className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Con reserva online</p>
              <p className="mt-2 text-2xl font-semibold">{bookableBusinessesCount}</p>
            </div>
            <div className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Confirmacion</p>
              <p className="mt-2 text-2xl font-semibold">En minutos</p>
            </div>
          </div>
        </div>

        {businesses.length === 0 ? (
          <section className="rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">Aun no hay negocios activos</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#655b4f]">
              Cuando un dueno active su negocio, aparecera en este catalogo publico.
            </p>
            <Button asChild className="mt-6 bg-[#c85a2e] text-white hover:bg-[#a94722]">
              <Link href="/register">Publicar mi negocio</Link>
            </Button>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <article
                key={business.id}
                className="flex min-h-72 flex-col rounded-[1.75rem] border border-[#e6d8c5] bg-[#fffcf6] p-5 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-[#fff0d2] px-3 py-1 text-xs font-semibold text-[#7b5d43]">
                      {business.categoryName}
                    </span>
                    {business.canBook ? (
                      <span className="rounded-full bg-[#c85a2e] px-3 py-1 text-xs font-semibold text-white">
                        Reserva online
                      </span>
                    ) : (
                      <span className="rounded-full border border-[#e6d8c5] px-3 py-1 text-xs font-semibold text-[#8a7058]">
                        Configurando
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">{business.name}</h2>
                    <p className="mt-1 text-sm text-[#8a7058]">
                      {business.city || "Ciudad no especificada"}
                    </p>
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-[#655b4f]">
                    {business.description || "Negocio disponible para reservas online."}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-2xl border border-[#eadccb] bg-[#fff8eb] p-3">
                      <p className="text-xs text-[#8a7058]">Servicios</p>
                      <p className="mt-1 font-semibold">{business.servicesCount}</p>
                    </div>
                    <div className="rounded-2xl border border-[#eadccb] bg-[#fff8eb] p-3">
                      <p className="text-xs text-[#8a7058]">Recursos</p>
                      <p className="mt-1 font-semibold">{business.resourcesCount}</p>
                    </div>
                  </div>
                </div>
                <Button
                  asChild
                  className={
                    business.canBook
                      ? "mt-5 bg-[#1e1b16] text-[#fffcf6] hover:bg-[#2d271f]"
                      : "mt-5 border-[#d6c7b5] bg-white"
                  }
                  variant={business.canBook ? "default" : "outline"}
                >
                  <Link href={`/businesses/${business.slug}`}>
                    {business.canBook ? "Ver horarios" : "Ver negocio"}
                  </Link>
                </Button>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
