import type { ReactNode } from "react"

type CustomerLayoutProps = {
  children: ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,#fff7ed,transparent_34%),linear-gradient(180deg,#fffaf2,#f7efe3)] text-[#2d241b]">
      {children}
    </div>
  )
}
