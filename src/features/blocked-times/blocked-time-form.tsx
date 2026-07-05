"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { formatResourceType } from "@/features/resources/resource-format"

import { createBlockedTimeAction } from "./blocked-time.actions"
import type { BlockedTimeActionState, BlockedTimeFormResource } from "./blocked-time.types"

const initialState: BlockedTimeActionState = {}

type BlockedTimeFormProps = {
  businessId: string
  resources: BlockedTimeFormResource[]
}

export function BlockedTimeForm({ businessId, resources }: BlockedTimeFormProps) {
  const [state, formAction, isPending] = useActionState(
    createBlockedTimeAction.bind(null, businessId),
    initialState,
  )

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="resourceId">
            Alcance
          </label>
          <select
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            id="resourceId"
            name="resourceId"
          >
            <option value="">Todo el negocio</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} · {formatResourceType(resource.type)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="startsAt">
            Inicio
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            id="startsAt"
            name="startsAt"
            required
            type="datetime-local"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="endsAt">
            Termino
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            id="endsAt"
            name="endsAt"
            required
            type="datetime-local"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="reason">
            Motivo
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            id="reason"
            name="reason"
            placeholder="Feriado, mantenimiento, vacaciones..."
            type="text"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button disabled={isPending} size="lg" type="submit">
          {isPending ? "Guardando..." : "Crear bloqueo"}
        </Button>
      </div>
    </form>
  )
}
