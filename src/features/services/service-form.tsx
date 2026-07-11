"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"

import { createServiceAction, updateServiceAction } from "./service.actions"
import type { ServiceActionState, ServiceFormValues } from "./service.types"

const initialState: ServiceActionState = {}

type ServiceFormProps = {
  businessId: string
  values?: ServiceFormValues
}

const defaultValues: ServiceFormValues = {
  name: "",
  description: "",
  durationMinutes: 30,
  price: "0",
  isActive: true,
}

export function ServiceForm({ businessId, values }: ServiceFormProps) {
  const formValues = values ?? defaultValues
  const action = formValues.id
    ? updateServiceAction.bind(null, businessId, formValues.id)
    : createServiceAction.bind(null, businessId)
  const [state, formAction, isPending] = useActionState(action, initialState)
  const isEditing = Boolean(formValues.id)

  return (
    <form action={formAction} className="space-y-6 rounded-[1.75rem] border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="name">
            Nombre del servicio
          </label>
          <input
            className="h-10 w-full rounded-lg border border-[#e6d8c5] bg-white px-3 text-sm outline-none focus:border-[#c85a2e] focus:ring-3 focus:ring-[#c85a2e]/20"
            defaultValue={formValues.name}
            id="name"
            name="name"
            required
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="durationMinutes">
            Duración en minutos
          </label>
          <input
            className="h-10 w-full rounded-lg border border-[#e6d8c5] bg-white px-3 text-sm outline-none focus:border-[#c85a2e] focus:ring-3 focus:ring-[#c85a2e]/20"
            defaultValue={formValues.durationMinutes}
            id="durationMinutes"
            min={1}
            name="durationMinutes"
            required
            step={1}
            type="number"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="price">
            Precio CLP
          </label>
          <input
            className="h-10 w-full rounded-lg border border-[#e6d8c5] bg-white px-3 text-sm outline-none focus:border-[#c85a2e] focus:ring-3 focus:ring-[#c85a2e]/20"
            defaultValue={formValues.price}
            id="price"
            min={0}
            name="price"
            required
            step={1}
            type="number"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="description">
            Descripción
          </label>
          <textarea
            className="min-h-28 w-full rounded-lg border border-[#e6d8c5] bg-white px-3 py-2 text-sm outline-none focus:border-[#c85a2e] focus:ring-3 focus:ring-[#c85a2e]/20"
            defaultValue={formValues.description}
            id="description"
            name="description"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium">
        <input defaultChecked={formValues.isActive} name="isActive" type="checkbox" />
        Servicio activo
      </label>

      <div className="flex justify-end">
        <Button disabled={isPending} size="lg" type="submit">
          {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear servicio"}
        </Button>
      </div>
    </form>
  )
}
