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

type AvailabilityPayload = {
  slots?: AvailableSlot[]
  error?: string
}

type BookingPayload = {
  error?: string
  code?: string
}

const bookingErrorMessages: Record<string, string> = {
  BLOCKED_TIME_CONFLICT: "Ese horario fue bloqueado por el negocio. Elige otro horario.",
  BOOKING_CONFLICT: "Ese horario acaba de ser reservado. Elige otro horario disponible.",
  BOOKING_IN_PAST: "No se puede reservar un horario que ya paso. Elige otra fecha u hora.",
  BUSINESS_NOT_ACTIVE: "Este negocio no esta recibiendo reservas por ahora.",
  OUTSIDE_AVAILABILITY: "Ese horario esta fuera de la disponibilidad del negocio.",
  RESOURCE_NOT_ACTIVE: "Este recurso ya no esta disponible para reservas.",
  RESOURCE_SERVICE_MISMATCH: "Este recurso no puede prestar el servicio seleccionado.",
  SERVICE_NOT_ACTIVE: "Este servicio ya no esta disponible para reservas.",
  UNAUTHORIZED: "Debes iniciar sesion para confirmar la reserva.",
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10)
}

function formatDateLabel(value: string) {
  if (!value) {
    return "Selecciona una fecha"
  }

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`))
}

function getBookingErrorMessage(payload: BookingPayload) {
  if (payload.code && bookingErrorMessages[payload.code]) {
    return bookingErrorMessages[payload.code]
  }

  return payload.error ?? "No se pudo crear la reserva."
}

export function PublicBookingFlow({ business, services, resources }: PublicBookingFlowProps) {
  const router = useRouter()
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "")
  const [selectedResourceId, setSelectedResourceId] = useState("")
  const [selectedDate, setSelectedDate] = useState(getTodayDateValue())
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [selectedSlotStartsAt, setSelectedSlotStartsAt] = useState("")
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const selectedService = services.find((service) => service.id === selectedServiceId)
  const compatibleResources = useMemo(
    () => resources.filter((resource) => resource.serviceIds.includes(selectedServiceId)),
    [resources, selectedServiceId],
  )
  const selectedResource = compatibleResources.find((resource) => resource.id === selectedResourceId)
  const effectiveResource = selectedResource ?? (compatibleResources.length === 1 ? compatibleResources[0] : null)
  const selectedSlot = slots.find((slot) => slot.startsAt === selectedSlotStartsAt)
  const needsResourceSelection = compatibleResources.length > 1

  useEffect(() => {
    if (!selectedServiceId || !effectiveResource?.id || !selectedDate) {
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({
      businessId: business.id,
      serviceId: selectedServiceId,
      resourceId: effectiveResource.id,
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
        const payload: AvailabilityPayload = await response.json()

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
  }, [business.id, effectiveResource?.id, selectedDate, selectedServiceId])

  function handleServiceSelect(serviceId: string) {
    setSelectedServiceId(serviceId)
    setSelectedResourceId("")
    setSelectedSlotStartsAt("")
    setSlots([])
    setError("")
  }

  function handleResourceSelect(resourceId: string) {
    setSelectedResourceId(resourceId)
    setSelectedSlotStartsAt("")
    setSlots([])
    setError("")
  }

  async function handleSubmit() {
    if (!effectiveResource) {
      setError("Selecciona con quien o donde quieres reservar.")
      return
    }

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
          resourceId: effectiveResource.id,
          startsAt: selectedSlot.startsAt,
        }),
      })
      const payload: BookingPayload = await response.json()

      if (response.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/businesses/${business.slug}/book`)}`)
        return
      }

      if (!response.ok) {
        setError(getBookingErrorMessage(payload))
        return
      }

      router.push("/me/bookings?created=1")
      router.refresh()
    } catch {
      setError("No se pudo crear la reserva.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
          <span className="rounded-full border bg-background px-3 py-1 font-medium text-foreground">1. Servicio</span>
          <span className="rounded-full border bg-background px-3 py-1 font-medium text-foreground">2. Recurso</span>
          <span className="rounded-full border bg-background px-3 py-1 font-medium text-foreground">3. Fecha</span>
          <span className="rounded-full border bg-background px-3 py-1 font-medium text-foreground">4. Confirmar</span>
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold">Elige un servicio</h2>
            <p className="text-sm text-muted-foreground">Selecciona que quieres reservar.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {services.map((service) => (
              <button
                className="rounded-2xl border p-4 text-left transition-colors hover:bg-muted/50 data-[selected=true]:border-foreground data-[selected=true]:bg-foreground data-[selected=true]:text-background"
                data-selected={selectedServiceId === service.id}
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                type="button"
              >
                <span className="block font-semibold">{service.name}</span>
                <span className="mt-2 block text-sm opacity-80">
                  {service.durationMinutes} min · ${service.price} CLP
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold">Elige con quien o donde</h2>
            <p className="text-sm text-muted-foreground">
              {compatibleResources.length === 1
                ? "Asignamos automaticamente el unico recurso disponible para este servicio."
                : "Selecciona el recurso que prestara el servicio."}
            </p>
          </div>

          {compatibleResources.length === 0 ? (
            <p className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              Este servicio aun no tiene recursos disponibles para reservar.
            </p>
          ) : needsResourceSelection ? (
            <div className="grid gap-3 md:grid-cols-2">
              {compatibleResources.map((resource) => (
                <button
                  className="rounded-2xl border p-4 text-left transition-colors hover:bg-muted/50 data-[selected=true]:border-foreground data-[selected=true]:bg-foreground data-[selected=true]:text-background"
                  data-selected={effectiveResource?.id === resource.id}
                  key={resource.id}
                  onClick={() => handleResourceSelect(resource.id)}
                  type="button"
                >
                  <span className="block font-semibold">{resource.name}</span>
                  <span className="mt-2 block text-sm opacity-80">{formatResourceType(resource.type)}</span>
                </button>
              ))}
            </div>
          ) : effectiveResource ? (
            <div className="rounded-2xl border bg-muted/40 p-4">
              <p className="font-medium">{effectiveResource.name}</p>
              <p className="text-sm text-muted-foreground">{formatResourceType(effectiveResource.type)}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold">Fecha y horario</h2>
            <p className="text-sm text-muted-foreground">Horarios en {business.timezone}.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="date">
              Fecha
            </label>
            <input
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 md:w-64"
              id="date"
              min={getTodayDateValue()}
              onChange={(event) => {
                setSelectedDate(event.target.value)
                setSelectedSlotStartsAt("")
                setSlots([])
                setError("")
              }}
              type="date"
              value={selectedDate}
            />
          </div>

          {isLoadingSlots ? <p className="text-sm text-muted-foreground">Cargando horarios...</p> : null}
          {!isLoadingSlots && effectiveResource && slots.length === 0 ? (
            <p className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              No hay horarios disponibles para esta fecha. Prueba otro dia.
            </p>
          ) : null}
          {!isLoadingSlots && !effectiveResource && compatibleResources.length > 0 ? (
            <p className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              Elige un recurso para ver horarios disponibles.
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
            <dt className="text-muted-foreground">Duracion y precio</dt>
            <dd className="font-medium">
              {selectedService ? `${selectedService.durationMinutes} min · $${selectedService.price} CLP` : "Pendiente"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Recurso</dt>
            <dd className="font-medium">{effectiveResource?.name ?? "Pendiente"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fecha</dt>
            <dd className="font-medium">{formatDateLabel(selectedDate)}</dd>
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
          disabled={!selectedSlot || !effectiveResource || isSubmitting}
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
