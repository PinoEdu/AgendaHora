import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  actionHref?: string
  actionLabel?: string
  className?: string
  description: string
  eyebrow?: string
  marker?: string
  secondaryHref?: string
  secondaryLabel?: string
  title: string
}

export function EmptyState({
  actionHref,
  actionLabel,
  className,
  description,
  eyebrow = "Siguiente paso",
  marker = "--:--",
  secondaryHref,
  secondaryLabel,
  title,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-8 text-center shadow-sm",
        className,
      )}
    >
      <CalendarGrid className="opacity-35" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <div className="rounded-3xl border bg-background px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
          <p className="font-display mt-1 text-2xl font-semibold tracking-tight">{marker}</p>
        </div>
        <h2 className="font-display mt-5 text-2xl font-semibold tracking-[-0.035em]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        {actionHref && actionLabel ? (
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
            {secondaryHref && secondaryLabel ? (
              <Button asChild variant="outline">
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
