export function formatResourceType(type: string) {
  const labels: Record<string, string> = {
    PROFESSIONAL: "Profesional",
    COURT: "Cancha",
    ROOM: "Sala",
    CHAIR: "Silla",
    BOX: "Box",
    MACHINE: "Maquina",
    SPACE: "Espacio",
    OTHER: "Otro",
  }

  return labels[type] ?? type
}
