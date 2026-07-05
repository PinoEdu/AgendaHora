import type { ResourceType } from "@/generated/prisma/enums"

export type BlockedTimeActionState = {
  error?: string
}

export type BlockedTimeFormResource = {
  id: string
  name: string
  type: ResourceType
}
