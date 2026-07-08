"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"
import { formatResourceType } from "@/features/resources/resource-format"
import { cn } from "@/lib/utils"

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

function getSlotHour(slot: AvailableSlot) {
  return Number(slot.localStartTime.split(":")[0] ?? "0")
}

function groupAvailableSlots(slots: AvailableSlot[]) {
  const slotGroups = [
    { id: "morning", title: "Manana", description: "Antes de las 12:00", slots: [] as AvailableSlot[] },
    { id: "afternoon", title: "Tarde", description: "12:00 a 18:59", slots: [] as AvailableSlot[] },
    { id: "evening", title: "Noche", description: "Desde las 19:00", slots: [] as AvailableSlot[] },
  ]

  for (const slot of slots) {
    const hour = getSlotHour(slot)

    if (hour < 12) {
      slotGroups[0]?.slots.push(slot)
    } else if (hour < 19) {
      slotGroups[1]?.slots.push(slot)
    } else {
      slotGroups[2]?.slots.push(slot)
    }
  }

  return slotGroups.filter((group) => group.slots.length > 0)
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
  const slotGroups = useMemo(() => groupAvailableSlots(slots), [slots])
  const activeStepId = !selectedService
    ? "service"
    : !effectiveResource
      ? "resource"
      : !selectedSlot
        ? "time"
        : "confirm"
  const stepItems = [
    {
      id: "service",
      label: "Servicio",
      value: selectedService?.name ?? "Pendiente",
    },
    {
      id: "resource",
      label: "Recurso",
      value: effectiveResource?.name ?? "Pendiente",
    },
    {
      id: "time",
      label: "Horario",
      value: selectedSlot ? selectedSlot.localStartTime : "Pendiente",
    },
    {
      id: "confirm",
      label: "Confirmar",
      value: selectedSlot ? "Listo" : "Pendiente",
    },
  ]

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
      <section className="relative space-y-6 overflow-hidden rounded-2xl border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm">
        <CalendarGrid className="opacity-55" />
        <div className="relative grid gap-2 text-sm sm:grid-cols-4">
          {stepItems.map((step, index) => {
            const isActive = step.id === activeStepId
            const isComplete =
              (step.id === "service" && Boolean(selectedService)) ||
              (step.id === "resource" && Boolean(effectiveResource)) ||
              (step.id === "time" && Boolean(selectedSlot)) ||
              (step.id === "confirm" && Boolean(selectedSlot))

            return (
              <div
                className={cn(
                  "rounded-2xl border px-3 py-2 transition-colors",
                  isActive
                    ? "border-[#1e1b16] bg-[#1e1b16] text-[#fffcf6]"
                    : isComplete
                      ? "border-[#c85a2e] bg-[#fff0d2] text-[#1e1b16]"
                      : "border-[#e6d8c5] bg-white/90 text-[#655b4f]",
                )}
                key={step.id}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">
                  {index + 1}. {step.label}
                </p>
                <p className="mt-1 truncate font-medium">{step.value}</p>
              </div>
            )
          })}
        </div>

        <div className="relative space-y-3">
          <div>
            <h2 className="text-xl font-semibold">Elige un servicio</h2>
            <p className="text-sm text-muted-foreground">Selecciona que quieres reservar.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {services.map((service) => (
              <button
                className="group rounded-2xl border border-[#e6d8c5] bg-white/90 p-4 text-left transition-colors hover:bg-[#fff8eb] data-[selected=true]:border-[#c85a2e] data-[selected=true]:bg-[#c85a2e] data-[selected=true]:text-white"
                data-selected={selectedServiceId === service.id}
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                type="button"
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-lg font-semibold">{service.name}</span>
                    <span className="mt-2 block text-sm opacity-80">{service.durationMinutes} min</span>
                  </span>
                  <span className="rounded-full bg-[#fff0d2] px-3 py-1 text-sm font-semibold text-[#7b5d43] group-data-[selected=true]:bg-white/20 group-data-[selected=true]:text-white">
                    ${service.price}
                  </span>
                </span>
                <span className="mt-4 block border-t border-dashed border-[#e6d8c5] pt-3 text-xs opacity-75 group-data-[selected=true]:border-white/30">
                  Compatible con {service.resourceIds.length} recurso{service.resourceIds.length === 1 ? "" : "s"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative space-y-3">
          <div>
            <h2 className="text-xl font-semibold">Elige con quien o donde</h2>
            <p className="text-sm text-muted-foreground">
              {compatibleResources.length === 1
                ? "Asignamos automaticamente el unico recurso disponible para este servicio."
                : "Selecciona el recurso que prestara el servicio."}
            </p>
          </div>

          {compatibleResources.length === 0 ? (
            <EmptyState
              className="rounded-xl border-[#e6d8c5] bg-[#fff8eb]/90 p-4 text-left"
              description="El negocio debe asociar este servicio a un profesional, sala, cancha o recurso activo antes de recibir reservas."
              eyebrow="Servicio sin recurso"
              marker="0"
              title="Este servicio aun no tiene recursos disponibles"
            />
          ) : needsResourceSelection ? (
            <div className="grid gap-3 md:grid-cols-2">
              {compatibleResources.map((resource) => (
                <button
                  className="flex items-center gap-3 rounded-2xl border border-[#e6d8c5] bg-white/90 p-4 text-left transition-colors hover:bg-[#fff8eb] data-[selected=true]:border-[#1e1b16] data-[selected=true]:bg-[#1e1b16] data-[selected=true]:text-[#fffcf6]"
                  data-selected={effectiveResource?.id === resource.id}
                  key={resource.id}
                  onClick={() => handleResourceSelect(resource.id)}
                  type="button"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0d2] text-base font-semibold text-[#7b5d43]">
                    {resource.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    <span className="block font-semibold">{resource.name}</span>
                    <span className="mt-1 block text-sm opacity-80">{formatResourceType(resource.type)}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : effectiveResource ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[#e6d8c5] bg-[#fff8eb]/90 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1e1b16] text-base font-semibold text-[#fffcf6]">
                {effectiveResource.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="font-medium">{effectiveResource.name}</p>
                <p className="text-sm text-muted-foreground">{formatResourceType(effectiveResource.type)}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative space-y-3">
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
            <EmptyState
              className="rounded-xl border-[#e6d8c5] bg-[#fff8eb]/90 p-4 text-left"
              description="No encontramos slots para esta combinacion. Prueba otra fecha o cambia el servicio/recurso seleccionado."
              eyebrow="Sin disponibilidad"
              marker="--:--"
              title="No hay horarios para esta fecha"
            />
          ) : null}
          {!isLoadingSlots && !effectiveResource && compatibleResources.length > 0 ? (
            <EmptyState
              className="rounded-xl border-[#e6d8c5] bg-[#fff8eb]/90 p-4 text-left"
              description="Selecciona quien o donde se prestara el servicio para cargar horarios disponibles."
              eyebrow="Falta recurso"
              marker="--:--"
              title="Elige un recurso para ver horarios"
            />
          ) : null}

          <div className="space-y-4">
            {slotGroups.map((group) => (
              <div className="rounded-2xl border border-[#e6d8c5] bg-white/80 p-4" key={group.id}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{group.title}</h3>
                    <p className="text-xs text-[#8a7058]">{group.description}</p>
                  </div>
                  <span className="rounded-full bg-[#fff0d2] px-3 py-1 text-xs font-semibold text-[#7b5d43]">
                    {group.slots.length} disponibles
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {group.slots.map((slot) => (
                    <button
                      className="rounded-xl border border-[#e6d8c5] bg-[#fffcf6] px-3 py-2 text-sm transition-colors hover:bg-[#fff0d2] data-[selected=true]:border-[#1e1b16] data-[selected=true]:bg-[#1e1b16] data-[selected=true]:text-[#fffcf6]"
                      data-selected={selectedSlotStartsAt === slot.startsAt}
                      key={slot.startsAt}
                      onClick={() => setSelectedSlotStartsAt(slot.startsAt)}
                      type="button"
                    >
                      <span className="block font-semibold">{slot.localStartTime}</span>
                      <span className="text-xs opacity-75">hasta {slot.localEndTime}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </section>

      <aside className="relative h-fit overflow-hidden rounded-2xl border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm">
        <CalendarGrid className="opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7058]">Comprobante</p>
              <h2 className="mt-2 text-2xl font-semibold">{business.name}</h2>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                selectedSlot ? "bg-emerald-50 text-emerald-800" : "bg-[#fff0d2] text-[#7b5d43]",
              )}
            >
              {selectedSlot ? "Listo" : "Pendiente"}
            </span>
          </div>

          <div className="mt-5 rounded-3xl bg-[#1e1b16] p-5 text-[#fffcf6]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#f2c66d]">Horario elegido</p>
            <p className="mt-2 text-4xl font-semibold leading-none">
              {selectedSlot ? selectedSlot.localStartTime : "--:--"}
            </p>
            <p className="mt-2 text-sm text-[#d8cfc1]">
              {selectedSlot ? `Hasta ${selectedSlot.localEndTime}` : "Selecciona un horario disponible"}
            </p>
          </div>

          <dl className="mt-5 divide-y divide-dashed divide-[#d9c9b6] rounded-3xl border border-[#e6d8c5] bg-white/80 text-sm">
            <div className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3">
              <dt className="text-[#8a7058]">Servicio</dt>
              <dd className="font-medium text-right">{selectedService?.name ?? "Selecciona un servicio"}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3">
              <dt className="text-[#8a7058]">Recurso</dt>
              <dd className="font-medium text-right">{effectiveResource?.name ?? "Pendiente"}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3">
              <dt className="text-[#8a7058]">Fecha</dt>
              <dd className="font-medium text-right">{formatDateLabel(selectedDate)}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3">
              <dt className="text-[#8a7058]">Duracion</dt>
              <dd className="font-medium text-right">
                {selectedService ? `${selectedService.durationMinutes} min` : "Pendiente"}
              </dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3">
              <dt className="text-[#8a7058]">Zona</dt>
              <dd className="font-medium text-right">{business.timezone}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-4">
              <dt className="font-semibold text-[#1e1b16]">Total</dt>
              <dd className="text-right text-xl font-semibold">
                {selectedService ? `$${selectedService.price} CLP` : "Pendiente"}
              </dd>
            </div>
          </dl>

          <Button
            className="mt-6 w-full bg-[#c85a2e] text-white hover:bg-[#a94722]"
            disabled={!selectedSlot || !effectiveResource || isSubmitting}
            onClick={handleSubmit}
            size="lg"
            type="button"
          >
            {isSubmitting ? "Confirmando..." : "Confirmar reserva"}
          </Button>
        </div>
      </aside>
    </div>
  )
}
