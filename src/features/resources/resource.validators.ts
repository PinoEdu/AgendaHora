import { z } from "zod"

import { ResourceType } from "@/generated/prisma/enums"

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
)

export const resourceSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre del recurso."),
  type: z.enum([
    ResourceType.PROFESSIONAL,
    ResourceType.COURT,
    ResourceType.ROOM,
    ResourceType.CHAIR,
    ResourceType.BOX,
    ResourceType.MACHINE,
    ResourceType.SPACE,
    ResourceType.OTHER,
  ]),
  description: optionalText,
  isActive: z.coerce.boolean<boolean>().default(true),
  serviceIds: z.array(z.string()).default([]),
})

export type ResourceInput = z.infer<typeof resourceSchema>
