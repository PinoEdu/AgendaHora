import type { DayOfWeek, ResourceType } from "@/generated/prisma/enums"

export type AvailabilityActionState = {
  error?: string
}

export type AvailabilityFormResource = {
  id: string
  name: string
  type: ResourceType
}

export type AvailabilityRuleListItem = {
  id: string
  dayOfWeek: DayOfWeek
  startMinute: number
  endMinute: number
  isActive: boolean
  resource: {
    id: string
    name: string
    type: ResourceType
  }
}
