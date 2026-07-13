import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { TicketCard } from "@/components/ui/ticket-card"
import { getPublicBusinesses } from "@/features/businesses/business-public.queries"

export default async function BusinessesPage() {
  const businesses = await getPublicBusinesses()

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f8f5ef] text-[#1e1b16]">
      <CalendarGrid className="opacity-40 [mask-image:radial-gradient(circle_at_top_left,black,transparent_54%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a7058]">Explorar</p>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Negocios</h1>
          <p className="text-[#655b4f]">Explora negocios locales y conoce sus servicios.</p>
        </div>

        {businesses.length === 0 ? (
          <EmptyState
            actionHref="/register"
            actionLabel="Publicar mi negocio"
            className="rounded-[2rem] border-[#e6d8c5] bg-[#fffcf6]"
            description="Cuando un dueño active su negocio, aparecerá en este catálogo público."
            eyebrow="Catálogo público"
            marker="0"
            title="Aún no hay negocios publicados"
          />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <TicketCard
                key={business.id}
                className="transition-transform hover:-translate-y-0.5"
                contentClassName="flex h-full flex-col"
              >
                <div className="flex-1 space-y-3">
                  <span className="inline-flex rounded-full bg-[#fff0d2] px-3 py-1 text-xs font-semibold text-[#7b5d43]">
                    {business.categoryName}
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">{business.name}</h2>
                    <p className="mt-1 text-sm text-[#8a7058]">
                      {business.city || "Ciudad no especificada"}
                    </p>
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-[#655b4f]">
                      {business.description || "Negocio disponible para reservas online."}
                    </p>
                </div>
                <Button
                  asChild
                  className="mt-5 border-[#d6c7b5] bg-white"
                  variant="outline"
                >
                  <Link href={`/businesses/${business.slug}`}>Ver negocio</Link>
                </Button>
              </TicketCard>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
