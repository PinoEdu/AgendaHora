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

export type GetAvailableSlotsInput = {
  businessId: string
  serviceId: string
  resourceId: string
  date: string
}

export type AvailableSlot = {
  startsAt: string
  endsAt: string
  localStartTime: string
  localEndTime: string
}

export type GetAvailableSlotsOutput = {
  timezone: string
  slots: AvailableSlot[]
}

export type TimeRange = {
  startsAt: Date
  endsAt: Date
}
