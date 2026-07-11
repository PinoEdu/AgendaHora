import type { ReactNode } from "react"

import { CalendarGrid } from "@/components/ui/calendar-grid"
import { cn } from "@/lib/utils"

type DashboardShellProps = {
  children: ReactNode
  className?: string
  size?: "md" | "lg"
}

type DashboardHeroProps = {
  actions?: ReactNode
  children?: ReactNode
  description: string
  eyebrow: string
  title: string
}

type DashboardPanelProps = {
  children: ReactNode
  className?: string
}

export function DashboardShell({ children, className, size = "lg" }: DashboardShellProps) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-svh w-full flex-col gap-8 px-6 py-10 text-[#1e1b16]",
        size === "md" ? "max-w-4xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </main>
  )
}

export function DashboardHero({ actions, children, description, eyebrow, title }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#2d241b] bg-[#1e1b16] p-6 text-[#fffcf6] shadow-[0_24px_80px_rgba(66,48,28,0.16)] md:p-8">
      <CalendarGrid className="opacity-25 [mask-image:radial-gradient(circle_at_top_right,black,transparent_62%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c66d]">{eyebrow}</p>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.045em]">{title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-[#d8cfc1]">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="relative mt-6">{children}</div> : null}
    </section>
  )
}

export function DashboardPanel({ children, className }: DashboardPanelProps) {
  return (
    <section className={cn("rounded-[1.75rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm", className)}>
      {children}
    </section>
  )
}

export const dashboardCardClassName = "border-[#e6d8c5] bg-[#fffcf6]"
export const dashboardPillClassName = "rounded-full border border-[#e6d8c5] bg-[#fff8eb] px-2.5 py-1 text-xs font-medium text-[#655b4f]"
export const dashboardMetricClassName = "rounded-2xl border border-white/10 bg-white/10 p-4"
