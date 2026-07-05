import type { ResourceType } from "@/generated/prisma/enums"

export type ResourceActionState = {
  error?: string
}

export type ResourceFormService = {
  id: string
  name: string
}

export type ResourceFormValues = {
  id?: string
  name: string
  type: ResourceType
  description: string
  isActive: boolean
  serviceIds: string[]
}
