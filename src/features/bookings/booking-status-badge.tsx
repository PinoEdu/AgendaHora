import { getBookingStatusMeta, type BookingStatusPerspective } from "@/features/bookings/booking-format"
import { cn } from "@/lib/utils"

type BookingStatusBadgeProps = {
  className?: string
  perspective?: BookingStatusPerspective
  showDescription?: boolean
  status: string
}

export function BookingStatusBadge({
  className,
  perspective = "business",
  showDescription = false,
  status,
}: BookingStatusBadgeProps) {
  const meta = getBookingStatusMeta(status, perspective)

  return (
    <span className={cn("inline-flex flex-col gap-1", className)}>
      <span
        aria-label={`${meta.label}: ${meta.description}`}
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
          meta.badgeClassName,
        )}
        title={meta.description}
      >
        <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", meta.dotClassName)} />
        {meta.label}
      </span>
      {showDescription ? <span className="max-w-xs text-xs leading-5 text-muted-foreground">{meta.description}</span> : null}
    </span>
  )
}
