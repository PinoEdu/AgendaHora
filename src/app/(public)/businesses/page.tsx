import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
import { getPublicBusinesses } from "@/features/businesses/business-public.queries"

export default async function BusinessesPage() {
  const businesses = await getPublicBusinesses()
  const bookableBusinessesCount = businesses.filter((business) => business.canBook).length

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f8f5ef] text-[#1e1b16]">
      <CalendarGrid className="opacity-40 [mask-image:radial-gradient(circle_at_top_left,black,transparent_54%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm md:p-8">
          <CalendarGrid className="opacity-70" />
          <div className="relative flex flex-col gap-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a7058]">
                Explorar
              </p>
              <h1 className="font-display max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Encuentra un horario, no solo un negocio.
              </h1>
              <p className="max-w-2xl text-[#655b4f]">
                Revisa negocios locales activos, compara servicios y entra directo al flujo de reserva cuando tengan disponibilidad configurada.
              </p>
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Activos</p>
              <p className="font-display mt-2 text-2xl font-semibold tracking-tight">{businesses.length}</p>
            </div>
            <div className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Con reserva online</p>
              <p className="font-display mt-2 text-2xl font-semibold tracking-tight">{bookableBusinessesCount}</p>
            </div>
            <div className="rounded-2xl border border-[#e6d8c5] bg-[#fff8eb] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Confirmación</p>
              <p className="font-display mt-2 text-2xl font-semibold tracking-tight">En minutos</p>
            </div>
          </div>
        </div>

        {businesses.length === 0 ? (
          <EmptyState
            actionHref="/register"
            actionLabel="Publicar mi negocio"
            className="rounded-[2rem] border-[#e6d8c5] bg-[#fffcf6]"
            description="Cuando un dueño active su negocio, aparecerá en este catálogo público con servicios, recursos y horarios disponibles."
            eyebrow="Catálogo público"
            marker="0"
            title="Aún no hay negocios activos"
          />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <TicketCard
                key={business.id}
                className="min-h-72 transition-transform hover:-translate-y-0.5"
                contentClassName="flex h-full flex-col"
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
                    <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">{business.name}</h2>
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
              </TicketCard>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
