"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export type AppNavbarLink = {
  exact?: boolean
  href: string
  label: string
}

type AppNavbarLinksProps = {
  links: AppNavbarLink[]
}

export function AppNavbarLinks({ links }: AppNavbarLinksProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Navegación principal">
      {links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`)

        return (
          <Link
            className={cn(
              "rounded-full px-3 py-2 font-medium transition-colors",
              isActive
                ? "bg-[#1e1b16] text-[#fffcf6]"
                : "text-[#655b4f] hover:bg-[#fff0d2] hover:text-[#1e1b16]",
            )}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
