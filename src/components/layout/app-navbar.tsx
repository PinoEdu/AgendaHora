import Link from "next/link"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/features/auth/logout-button"
import { UserRole } from "@/generated/prisma/enums"

import { AppNavbarLinks, type AppNavbarLink } from "./app-navbar-links"

function getNavbarLinks(role?: UserRole): AppNavbarLink[] {
  const baseLinks: AppNavbarLink[] = [
    { exact: true, href: "/", label: "Inicio" },
    { href: "/businesses", label: "Explorar" },
  ]

  if (role === UserRole.BUSINESS_OWNER) {
    return [
      ...baseLinks,
      { exact: true, href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/businesses", label: "Mis negocios" },
      { exact: true, href: "/dashboard/businesses/new", label: "Crear negocio" },
    ]
  }

  if (role === UserRole.CUSTOMER) {
    return [...baseLinks, { href: "/me/bookings", label: "Mis reservas" }]
  }

  return baseLinks
}

export async function AppNavbar() {
  const session = await auth()
  const role = session?.user.role
  const links = getNavbarLinks(role)

  return (
    <header className="sticky top-0 z-50 border-b border-[#e6d8c5] bg-[#fffcf6]/95 px-4 py-3 text-[#1e1b16] shadow-sm backdrop-blur md:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link className="font-display text-xl font-semibold tracking-[-0.035em]" href="/">
            AgendaHora
          </Link>
          {session?.user ? (
            <span className="rounded-full border border-[#e6d8c5] bg-[#fff8eb] px-3 py-1 text-xs font-medium text-[#655b4f] md:hidden">
              {session.user.name || session.user.email}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <AppNavbarLinks links={links} />
          <div className="flex flex-wrap items-center gap-2">
            {session?.user ? (
              <>
                <span className="hidden max-w-44 truncate text-sm text-[#655b4f] md:inline">
                  {session.user.name || session.user.email}
                </span>
                <LogoutButton className="border-[#d6c7b5] bg-white text-[#1e1b16] hover:bg-[#fff0d2]" />
              </>
            ) : (
              <>
                <Button asChild className="border-[#d6c7b5] bg-white" variant="outline">
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild className="bg-[#c85a2e] text-white hover:bg-[#a94722]">
                  <Link href="/register">Crear cuenta</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
