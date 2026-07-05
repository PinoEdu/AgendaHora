export function formatBusinessStatus(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Borrador",
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
  }

  return labels[status] ?? status
}
