import type { ReactNode } from "react"

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_right,#fde68a55,transparent_28%),linear-gradient(180deg,#f8fafc,#e2e8f0)] text-slate-950">
      {children}
    </div>
  )
}
