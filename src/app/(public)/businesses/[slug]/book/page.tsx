import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
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
    <main className="min-h-svh bg-[#f8f5ef] text-[#1e1b16]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
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
                <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Elige tu horario</h1>
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
          <section className="rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">Este negocio aun no acepta reservas</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#655b4f]">
              Faltan servicios o recursos activos para completar el flujo de reserva.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="bg-[#1e1b16] text-[#fffcf6] hover:bg-[#2d271f]">
                <Link href={`/businesses/${business.slug}`}>Volver al perfil</Link>
              </Button>
              <Button asChild className="border-[#d6c7b5] bg-white" variant="outline">
                <Link href="/businesses">Explorar otros negocios</Link>
              </Button>
            </div>
          </section>
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
