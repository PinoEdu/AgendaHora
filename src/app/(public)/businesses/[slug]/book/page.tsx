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
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{business.categoryName}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Reserva en {business.name}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/businesses/${business.slug}`}>Volver al perfil</Link>
        </Button>
      </div>

      {business.services.length === 0 || business.resources.length === 0 ? (
        <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Este negocio aun no acepta reservas</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Faltan servicios o recursos activos para completar el flujo de reserva.
          </p>
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
    </main>
  )
}
