export type BookingStatusPerspective = "business" | "customer"

type BookingStatusMeta = {
  badgeClassName: string
  businessDescription: string
  businessLabel: string
  customerDescription: string
  customerLabel: string
  dotClassName: string
}

const bookingStatusMeta: Record<string, BookingStatusMeta> = {
  PENDING: {
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-900",
    businessDescription: "Requiere revision del negocio y bloquea la agenda.",
    businessLabel: "Por revisar",
    customerDescription: "El negocio aun debe confirmar este horario.",
    customerLabel: "Pendiente",
    dotClassName: "bg-amber-500",
  },
  CONFIRMED: {
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
    businessDescription: "Atencion programada; este horario esta ocupado.",
    businessLabel: "Confirmada",
    customerDescription: "Tu horario esta reservado y confirmado.",
    customerLabel: "Confirmada",
    dotClassName: "bg-emerald-500",
  },
  CANCELLED_BY_CUSTOMER: {
    badgeClassName: "border-stone-200 bg-stone-50 text-stone-700",
    businessDescription: "El cliente cancelo; el horario vuelve a estar disponible.",
    businessLabel: "Cancelada por cliente",
    customerDescription: "Cancelaste esta reserva; ya no ocupa agenda.",
    customerLabel: "Cancelada por ti",
    dotClassName: "bg-stone-400",
  },
  CANCELLED_BY_BUSINESS: {
    badgeClassName: "border-stone-200 bg-stone-50 text-stone-700",
    businessDescription: "Fue cancelada desde la operacion del negocio.",
    businessLabel: "Cancelada por negocio",
    customerDescription: "El negocio cancelo esta reserva.",
    customerLabel: "Cancelada por negocio",
    dotClassName: "bg-stone-400",
  },
  COMPLETED: {
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-900",
    businessDescription: "Atencion finalizada y cerrada en el historial.",
    businessLabel: "Completada",
    customerDescription: "La atencion ya fue realizada.",
    customerLabel: "Completada",
    dotClassName: "bg-sky-500",
  },
  NO_SHOW: {
    badgeClassName: "border-red-200 bg-red-50 text-red-900",
    businessDescription: "El cliente no asistio al horario reservado.",
    businessLabel: "No-show",
    customerDescription: "Quedo registrada como no asistida.",
    customerLabel: "No asististe",
    dotClassName: "bg-red-500",
  },
}

export function getBookingStatusMeta(
  status: string,
  perspective: BookingStatusPerspective = "business",
) {
  const meta = bookingStatusMeta[status]

  if (!meta) {
    return {
      badgeClassName: "border-slate-200 bg-slate-50 text-slate-700",
      description: "Estado sin descripcion disponible.",
      dotClassName: "bg-slate-400",
      label: status,
    }
  }

  return {
    badgeClassName: meta.badgeClassName,
    description: perspective === "customer" ? meta.customerDescription : meta.businessDescription,
    dotClassName: meta.dotClassName,
    label: perspective === "customer" ? meta.customerLabel : meta.businessLabel,
  }
}

export function formatBookingStatus(
  status: string,
  perspective: BookingStatusPerspective = "business",
) {
  return getBookingStatusMeta(status, perspective).label
}
