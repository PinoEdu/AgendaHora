"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { formatResourceType } from "@/features/resources/resource-format"

import { createAvailabilityRuleAction } from "./availability.actions"
import { dayOfWeekOptions, formatDayOfWeek } from "./availability-format"
import type { AvailabilityActionState, AvailabilityFormResource } from "./availability.types"

const initialState: AvailabilityActionState = {}

type AvailabilityFormProps = {
  businessId: string
  resources: AvailabilityFormResource[]
}

export function AvailabilityForm({ businessId, resources }: AvailabilityFormProps) {
  const [state, formAction, isPending] = useActionState(
    createAvailabilityRuleAction.bind(null, businessId),
    initialState,
  )

  return (
    <form action={formAction} className="space-y-6 rounded-[1.75rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="resourceId">
            Recurso
          </label>
          <select
            className="h-10 w-full rounded-lg border border-[#e6d8c5] bg-white px-3 text-sm outline-none focus:border-[#c85a2e] focus:ring-3 focus:ring-[#c85a2e]/20"
            id="resourceId"
            name="resourceId"
            required
          >
            <option value="">Selecciona un recurso</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} · {formatResourceType(resource.type)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="dayOfWeek">
            Día
          </label>
          <select
            className="h-10 w-full rounded-lg border border-[#e6d8c5] bg-white px-3 text-sm outline-none focus:border-[#c85a2e] focus:ring-3 focus:ring-[#c85a2e]/20"
            id="dayOfWeek"
            name="dayOfWeek"
            required
          >
            {dayOfWeekOptions.map((dayOfWeek) => (
              <option key={dayOfWeek} value={dayOfWeek}>
                {formatDayOfWeek(dayOfWeek)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="startTime">
              Inicio
            </label>
            <input
              className="h-10 w-full rounded-lg border border-[#e6d8c5] bg-white px-3 text-sm outline-none focus:border-[#c85a2e] focus:ring-3 focus:ring-[#c85a2e]/20"
              defaultValue="09:00"
              id="startTime"
              name="startTime"
              required
              type="time"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="endTime">
              Término
            </label>
            <input
              className="h-10 w-full rounded-lg border border-[#e6d8c5] bg-white px-3 text-sm outline-none focus:border-[#c85a2e] focus:ring-3 focus:ring-[#c85a2e]/20"
              defaultValue="18:00"
              id="endTime"
              name="endTime"
              required
              type="time"
            />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium">
        <input defaultChecked name="isActive" type="checkbox" />
        Regla activa
      </label>

      <div className="flex justify-end">
        <Button disabled={isPending || resources.length === 0} size="lg" type="submit">
          {isPending ? "Guardando..." : "Agregar horario"}
        </Button>
      </div>
    </form>
  )
}
