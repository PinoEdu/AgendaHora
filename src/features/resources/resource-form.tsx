"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { ResourceType } from "@/generated/prisma/enums"

import { createResourceAction, updateResourceAction } from "./resource.actions"
import { formatResourceType } from "./resource-format"
import type { ResourceActionState, ResourceFormService, ResourceFormValues } from "./resource.types"

const initialState: ResourceActionState = {}

type ResourceFormProps = {
  businessId: string
  services: ResourceFormService[]
  values?: ResourceFormValues
}

const defaultValues: ResourceFormValues = {
  name: "",
  type: ResourceType.OTHER,
  description: "",
  isActive: true,
  serviceIds: [],
}

export function ResourceForm({ businessId, services, values }: ResourceFormProps) {
  const formValues = values ?? defaultValues
  const action = formValues.id
    ? updateResourceAction.bind(null, businessId, formValues.id)
    : createResourceAction.bind(null, businessId)
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
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Nombre del recurso
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
          <label className="text-sm font-medium" htmlFor="type">
            Tipo
          </label>
          <select
            className="h-10 w-full rounded-lg border border-[#e6d8c5] bg-white px-3 text-sm outline-none focus:border-[#c85a2e] focus:ring-3 focus:ring-[#c85a2e]/20"
            defaultValue={formValues.type}
            id="type"
            name="type"
            required
          >
            {Object.values(ResourceType).map((type) => (
              <option key={type} value={type}>
                {formatResourceType(type)}
              </option>
            ))}
          </select>
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

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Servicios que puede prestar</legend>
        {services.length === 0 ? (
            <p className="rounded-xl border border-[#e6d8c5] bg-[#fff8eb] p-4 text-sm text-muted-foreground">
            Primero crea servicios activos para asociarlos a este recurso.
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {services.map((service) => (
              <label
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e6d8c5] bg-white p-3 text-sm transition-colors hover:bg-[#fff8eb]"
                key={service.id}
              >
                <input
                  defaultChecked={formValues.serviceIds.includes(service.id)}
                  name="serviceIds"
                  type="checkbox"
                  value={service.id}
                />
                <span>{service.name}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <label className="flex items-center gap-3 text-sm font-medium">
        <input defaultChecked={formValues.isActive} name="isActive" type="checkbox" />
        Recurso activo
      </label>

      <div className="flex justify-end">
        <Button disabled={isPending} size="lg" type="submit">
          {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear recurso"}
        </Button>
      </div>
    </form>
  )
}
