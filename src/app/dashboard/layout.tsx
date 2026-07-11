import type { ReactNode } from "react"

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_right,#f2c66d66,transparent_30%),radial-gradient(circle_at_bottom_left,#fff0d2,transparent_36%),linear-gradient(180deg,#fffaf2,#f7efe3)] text-[#1e1b16]">
      {children}
    </div>
  )
}
