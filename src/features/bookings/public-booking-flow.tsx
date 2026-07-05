"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { formatResourceType } from "@/features/resources/resource-format"

type PublicBookingService = {
  id: string
  name: string
  durationMinutes: number
  price: string
  resourceIds: string[]
}

type PublicBookingResource = {
  id: string
  name: string
  type: string
  serviceIds: string[]
}

type AvailableSlot = {
  startsAt: string
  endsAt: string
  localStartTime: string
  localEndTime: string
}

type PublicBookingFlowProps = {
  business: {
    id: string
    name: string
    slug: string
    timezone: string
  }
  services: PublicBookingService[]
  resources: PublicBookingResource[]
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10)
}

export function PublicBookingFlow({ business, services, resources }: PublicBookingFlowProps) {
  const router = useRouter()
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "")
  const compatibleResources = useMemo(
    () => resources.filter((resource) => resource.serviceIds.includes(selectedServiceId)),
    [resources, selectedServiceId],
  )
  const [selectedResourceId, setSelectedResourceId] = useState(compatibleResources[0]?.id ?? "")
  const effectiveResourceId = compatibleResources.some((resource) => resource.id === selectedResourceId)
    ? selectedResourceId
    : (compatibleResources[0]?.id ?? "")
  const [selectedDate, setSelectedDate] = useState(getTodayDateValue())
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [selectedSlotStartsAt, setSelectedSlotStartsAt] = useState("")
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!selectedServiceId || !effectiveResourceId || !selectedDate) {
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({
      businessId: business.id,
      serviceId: selectedServiceId,
      resourceId: effectiveResourceId,
      date: selectedDate,
    })

    async function loadSlots() {
      setIsLoadingSlots(true)
      setSelectedSlotStartsAt("")
      setError("")

      try {
        const response = await fetch(`/api/availability?${params.toString()}`, {
          signal: controller.signal,
        })
        const payload: { slots?: AvailableSlot[]; error?: string } = await response.json()

        if (!response.ok) {
          setSlots([])
          setError(payload.error ?? "No se pudo cargar la disponibilidad.")
          return
        }

        setSlots(payload.slots ?? [])
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return
        }

        setSlots([])
        setError("No se pudo cargar la disponibilidad.")
      } finally {
        setIsLoadingSlots(false)
      }
    }

    void loadSlots()

    return () => controller.abort()
  }, [business.id, effectiveResourceId, selectedDate, selectedServiceId])

  const selectedService = services.find((service) => service.id === selectedServiceId)
  const selectedSlot = slots.find((slot) => slot.startsAt === selectedSlotStartsAt)

  async function handleSubmit() {
    if (!selectedSlot) {
      setError("Selecciona un horario disponible.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: selectedServiceId,
          resourceId: effectiveResourceId,
          startsAt: selectedSlot.startsAt,
        }),
      })
      const payload: { error?: string } = await response.json()

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (!response.ok) {
        setError(payload.error ?? "No se pudo crear la reserva.")
        return
      }

      router.push("/me/bookings")
      router.refresh()
    } catch {
      setError("No se pudo crear la reserva.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="serviceId">
            Servicio
          </label>
          <select
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            id="serviceId"
            onChange={(event) => setSelectedServiceId(event.target.value)}
            value={selectedServiceId}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · {service.durationMinutes} min · ${service.price} CLP
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="resourceId">
            Recurso
          </label>
          <select
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            disabled={compatibleResources.length === 0}
            id="resourceId"
            onChange={(event) => setSelectedResourceId(event.target.value)}
            value={effectiveResourceId}
          >
            {compatibleResources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} · {formatResourceType(resource.type)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="date">
            Fecha
          </label>
          <input
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            id="date"
            min={getTodayDateValue()}
            onChange={(event) => setSelectedDate(event.target.value)}
            type="date"
            value={selectedDate}
          />
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold">Horarios disponibles</h2>
          {isLoadingSlots ? <p className="text-sm text-muted-foreground">Cargando horarios...</p> : null}
          {!isLoadingSlots && slots.length === 0 ? (
            <p className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              No hay horarios disponibles para esta seleccion.
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-3">
            {slots.map((slot) => (
              <button
                className="rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-50 data-[selected=true]:border-foreground data-[selected=true]:bg-foreground data-[selected=true]:text-background"
                data-selected={selectedSlotStartsAt === slot.startsAt}
                key={slot.startsAt}
                onClick={() => setSelectedSlotStartsAt(slot.startsAt)}
                type="button"
              >
                {slot.localStartTime} - {slot.localEndTime}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </section>

      <aside className="h-fit rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Resumen</p>
        <h2 className="mt-1 text-2xl font-semibold">{business.name}</h2>
        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Servicio</dt>
            <dd className="font-medium">{selectedService?.name ?? "Selecciona un servicio"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fecha</dt>
            <dd className="font-medium">{selectedDate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Horario</dt>
            <dd className="font-medium">
              {selectedSlot ? `${selectedSlot.localStartTime} - ${selectedSlot.localEndTime}` : "Sin horario"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Zona horaria</dt>
            <dd className="font-medium">{business.timezone}</dd>
          </div>
        </dl>

        <Button
          className="mt-6 w-full"
          disabled={!selectedSlot || isSubmitting}
          onClick={handleSubmit}
          size="lg"
          type="button"
        >
          {isSubmitting ? "Confirmando..." : "Confirmar reserva"}
        </Button>
      </aside>
    </div>
  )
}
