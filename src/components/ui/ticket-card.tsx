import type { HTMLAttributes } from "react"

import { CalendarGrid } from "@/components/ui/calendar-grid"
import { cn } from "@/lib/utils"

type TicketCardProps = HTMLAttributes<HTMLElement> & {
  contentClassName?: string
}

export function TicketCard({ children, className, contentClassName, ...props }: TicketCardProps) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-[#e6d8c5] bg-[#fffcf6] p-5 shadow-sm",
        className,
      )}
      {...props}
    >
      <CalendarGrid className="opacity-60 [mask-image:linear-gradient(to_right,black,transparent_86%)]" />
      <span
        aria-hidden="true"
        className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-[#e6d8c5] bg-[#f8f5ef]"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-5 left-7 top-5 border-l border-dashed border-[#d9c9b6]"
      />
      <div className={cn("relative pl-7", contentClassName)}>{children}</div>
    </article>
  )
}
