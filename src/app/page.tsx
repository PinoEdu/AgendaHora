import Link from "next/link"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { LogoutButton } from "@/features/auth/logout-button"
import { InteractiveBookingPreview } from "@/features/home/interactive-booking-preview"
import { UserRole } from "@/generated/prisma/enums"

export default async function Home() {
  const session = await auth()
  const dashboardHref =
    session?.user.role === UserRole.BUSINESS_OWNER ? "/dashboard" : "/me/bookings"

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f8f5ef] text-[#1e1b16]">
      <CalendarGrid className="opacity-45 [mask-image:radial-gradient(circle_at_top_right,black,transparent_58%)]" />
      <section className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center gap-14 px-6 py-10 lg:py-16">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold tracking-[0.28em] uppercase" href="/">
            AgendaHora
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm">
            <Button asChild className="border-[#e6d8c5] bg-[#fffcf6]" variant="outline">
              <Link href="/businesses">Explorar</Link>
            </Button>
            {session?.user ? (
              <>
                <Button asChild className="bg-[#1e1b16] text-[#fffcf6] hover:bg-[#2d271f]">
                  <Link href={dashboardHref}>Mi cuenta</Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <Button asChild className="bg-[#c85a2e] text-white hover:bg-[#a94722]">
                <Link href="/register">Crear cuenta</Link>
              </Button>
            )}
          </nav>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="w-fit rounded-full border border-[#e6d8c5] bg-[#fffcf6] px-4 py-2 text-xs font-semibold tracking-[0.22em] uppercase text-[#7b5d43]">
                Reservas locales sin doble agenda
              </p>
              <h1 className="font-display max-w-3xl text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-7xl">
                Encuentra un horario, no solo un negocio.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#655b4f]">
                AgendaHora conecta clientes con barberias, canchas, dentistas y servicios locales que muestran disponibilidad real antes de confirmar una reserva.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-[#c85a2e] text-white hover:bg-[#a94722]" size="lg">
                <Link href="/businesses">Buscar servicios</Link>
              </Button>
              {session?.user ? (
                <Button asChild className="border-[#d6c7b5] bg-[#fffcf6]" size="lg" variant="outline">
                  <Link href={dashboardHref}>Ir a mi cuenta</Link>
                </Button>
              ) : (
                <Button asChild className="border-[#d6c7b5] bg-[#fffcf6]" size="lg" variant="outline">
                  <Link href="/register">Publicar mi negocio</Link>
                </Button>
              )}
            </div>
          </div>

          <InteractiveBookingPreview />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Busca", "Explora negocios activos con servicios disponibles para reservar."],
            ["Elige horario", "Selecciona servicio, profesional o espacio, fecha y hora."],
            ["Confirma", "La app revalida disponibilidad antes de crear la reserva."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-3xl border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#655b4f]">{description}</p>
            </article>
          ))}
        </div>

        <section className="rounded-[2rem] border border-[#e6d8c5] bg-[#1e1b16] p-6 text-[#fffcf6] md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-[#f2c66d]">Para duenos</p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.04em]">Publica servicios, recursos y disponibilidad.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d8cfc1]">
                Configura quien atiende, que servicios presta y que horarios estan disponibles para evitar reservas duplicadas.
              </p>
            </div>
            <Button asChild className="bg-[#f2c66d] text-[#1e1b16] hover:bg-[#e7b84d]" size="lg">
              <Link href={session?.user.role === UserRole.BUSINESS_OWNER ? "/dashboard" : "/register"}>
                {session?.user.role === UserRole.BUSINESS_OWNER ? "Ir al dashboard" : "Crear negocio"}
              </Link>
            </Button>
          </div>
        </section>
      </section>
    </main>
  )
}
