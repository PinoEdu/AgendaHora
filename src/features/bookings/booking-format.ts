export function formatBookingStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    CANCELLED_BY_CUSTOMER: "Cancelada por cliente",
    CANCELLED_BY_BUSINESS: "Cancelada por negocio",
    COMPLETED: "Completada",
    NO_SHOW: "No asistio",
  }

  return labels[status] ?? status
}
