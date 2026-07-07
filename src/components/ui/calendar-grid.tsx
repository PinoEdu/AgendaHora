import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

export function CalendarGrid({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(200,90,46,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,90,46,0.08)_1px,transparent_1px)] bg-[size:42px_42px]",
        className,
      )}
      {...props}
    />
  )
}
