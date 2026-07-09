import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { getPublicBusinessBySlug } from "@/features/businesses/business-public.queries"
import { PublicBookingFlow } from "@/features/bookings/public-booking-flow"

type PublicBookingPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function PublicBookingPage({ params }: PublicBookingPageProps) {
  const session = await auth()

  const { slug } = await params

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/businesses/${slug}/book`)}`)
  }

  const business = await getPublicBusinessBySlug(slug)

  if (!business) {
    notFound()
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f8f5ef] text-[#1e1b16]">
      <CalendarGrid className="opacity-40 [mask-image:radial-gradient(circle_at_top_left,black,transparent_56%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm md:p-8">
          <CalendarGrid className="opacity-75" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#8a7058]">
                <Link className="underline-offset-4 hover:underline" href="/businesses">
                  Negocios
                </Link>{" "}
                /{" "}
                <Link className="underline-offset-4 hover:underline" href={`/businesses/${business.slug}`}>
                  {business.name}
                </Link>{" "}
                / Reservar
              </p>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a7058]">
                  {business.categoryName}
                </p>
                <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Elige tu horario</h1>
                <p className="mt-3 max-w-2xl text-[#655b4f]">
                  Reserva en {business.name}. Los horarios se muestran en {business.timezone} y se validan antes de confirmar.
                </p>
              </div>
            </div>
            <Button asChild className="border-[#d6c7b5] bg-white" variant="outline">
              <Link href={`/businesses/${business.slug}`}>Volver al perfil</Link>
            </Button>
          </div>
        </div>

        {business.services.length === 0 || business.resources.length === 0 ? (
          <EmptyState
            actionHref={`/businesses/${business.slug}`}
            actionLabel="Volver al perfil"
            className="rounded-[2rem] border-[#e6d8c5] bg-[#fffcf6]"
            description="Faltan servicios o recursos activos para completar una reserva. Puedes revisar el perfil o buscar otro negocio disponible."
            eyebrow="Reservas pausadas"
            marker="--:--"
            secondaryHref="/businesses"
            secondaryLabel="Explorar otros negocios"
            title="Este negocio aún no acepta reservas"
          />
        ) : (
          <PublicBookingFlow
            business={{
              id: business.id,
              name: business.name,
              slug: business.slug,
              timezone: business.timezone,
            }}
            resources={business.resources}
            services={business.services}
          />
        )}
      </div>
    </main>
  )
}
