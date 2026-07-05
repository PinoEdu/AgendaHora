"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { BusinessStatus } from "@/generated/prisma/enums"

import { createBusinessAction, updateBusinessAction } from "./business.actions"
import { formatBusinessStatus } from "./business-format"
import type { BusinessActionState, BusinessFormCategory, BusinessFormValues } from "./business.types"

const initialState: BusinessActionState = {}

type BusinessFormProps = {
  categories: BusinessFormCategory[]
  values?: BusinessFormValues
}

const defaultValues: BusinessFormValues = {
  name: "",
  categoryId: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "CL",
  timezone: "America/Santiago",
  status: BusinessStatus.DRAFT,
}

export function BusinessForm({ categories, values }: BusinessFormProps) {
  const formValues = values ?? defaultValues
  const action = formValues.id
    ? updateBusinessAction.bind(null, formValues.id)
    : createBusinessAction
  const [state, formAction, isPending] = useActionState(action, initialState)
  const isEditing = Boolean(formValues.id)

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="name">
            Nombre del negocio
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={formValues.name}
            id="name"
            name="name"
            required
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="categoryId">
            Categoria
          </label>
          <select
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={formValues.categoryId}
            id="categoryId"
            name="categoryId"
            required
          >
            <option value="">Selecciona una categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="status">
              Estado
            </label>
            <select
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
              defaultValue={formValues.status}
              id="status"
              name="status"
              required
            >
              {Object.values(BusinessStatus).map((status) => (
                <option key={status} value={status}>
                  {formatBusinessStatus(status)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="city">
            Ciudad
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={formValues.city}
            id="city"
            name="city"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="country">
            Pais
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={formValues.country}
            id="country"
            name="country"
            required
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="phone">
            Telefono
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={formValues.phone}
            id="phone"
            name="phone"
            type="tel"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email del negocio
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={formValues.email}
            id="email"
            name="email"
            type="email"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="address">
            Direccion
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={formValues.address}
            id="address"
            name="address"
            type="text"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="timezone">
            Zona horaria
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={formValues.timezone}
            id="timezone"
            name="timezone"
            required
            type="text"
          />
          <p className="text-xs text-muted-foreground">
            Para Chile usa America/Santiago. Esta zona se usara para calcular disponibilidad.
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="description">
            Descripcion
          </label>
          <textarea
            className="min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            defaultValue={formValues.description}
            id="description"
            name="description"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button disabled={isPending} size="lg" type="submit">
          {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear negocio"}
        </Button>
      </div>
    </form>
  )
}
