"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { CalendarGrid } from "@/components/ui/calendar-grid"
import { EmptyState } from "@/components/ui/empty-state"

type RescheduleBookingFlowProps = {
  booking: {
    id: string
    business: {
      name: string
      timezone: string
    }
    currentDate: string
    currentEndTime: string
    currentStartTime: string
    resource: {
      name: string
    }
    service: {
      durationMinutes: number
      name: string
    }
  }
}

type AvailableSlot = {
  startsAt: string
  endsAt: string
  localStartTime: string
  localEndTime: string
}

type AvailabilityPayload = {
  slots?: AvailableSlot[]
  error?: string
}

type ReschedulePayload = {
  error?: string
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10)
}

function addMinutesToLocalTime(localTime: string, minutesToAdd: number) {
  const [hourValue, minuteValue] = localTime.split(":")
  const hour = Number(hourValue)
  const minute = Number(minuteValue)

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return localTime
  }

  const totalMinutes = (hour * 60 + minute + minutesToAdd) % (24 * 60)
  const endHour = Math.floor(totalMinutes / 60)
  const endMinute = totalMinutes % 60

  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`
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

export function RescheduleBookingFlow({ booking }: RescheduleBookingFlowProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(booking.currentDate)
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [selectedSlotStartsAt, setSelectedSlotStartsAt] = useState("")
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const selectedSlot = slots.find((slot) => slot.startsAt === selectedSlotStartsAt)
  const slotGroups = groupAvailableSlots(slots)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ date: selectedDate })

    async function loadSlots() {
      setIsLoadingSlots(true)
      setSelectedSlotStartsAt("")
      setError("")

      try {
        const response = await fetch(`/api/bookings/${booking.id}/availability?${params.toString()}`, {
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
  }, [booking.id, selectedDate])

  async function handleSubmit() {
    if (!selectedSlot) {
      setError("Selecciona un nuevo horario disponible.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        body: JSON.stringify({ startsAt: selectedSlot.startsAt }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      })
      const payload: ReschedulePayload = await response.json()

      if (response.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/me/bookings/${booking.id}/reschedule`)}`)
        return
      }

      if (!response.ok) {
        setError(payload.error ?? "No se pudo reprogramar la reserva.")
        return
      }

      router.push("/me/bookings?rescheduled=1")
      router.refresh()
    } catch {
      setError("No se pudo reprogramar la reserva.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section className="relative space-y-5 overflow-hidden rounded-2xl border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm">
        <CalendarGrid className="opacity-50" />
        <div className="relative">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]">Nuevo horario</h2>
          <p className="mt-1 text-sm text-muted-foreground">Horarios en {booking.business.timezone}.</p>
        </div>

        <div className="relative space-y-2">
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

        {isLoadingSlots ? <p className="relative text-sm text-muted-foreground">Cargando horarios...</p> : null}

        {!isLoadingSlots && slots.length === 0 ? (
          <EmptyState
            className="relative rounded-xl border-[#e6d8c5] bg-[#fff8eb]/90 p-4 text-left"
            description="Prueba otra fecha para encontrar un horario disponible con el mismo servicio y recurso."
            eyebrow="Sin disponibilidad"
            marker="--:--"
            title="No hay horarios para esta fecha"
          />
        ) : null}

        <div className="relative space-y-4">
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
                    className="rounded-xl border border-[#e6d8c5] bg-[#fffcf6] px-3 py-2.5 text-center text-sm transition-colors hover:bg-[#fff0d2] data-[selected=true]:border-[#1e1b16] data-[selected=true]:bg-[#1e1b16] data-[selected=true]:text-[#fffcf6]"
                    data-selected={selectedSlotStartsAt === slot.startsAt}
                    key={slot.startsAt}
                    onClick={() => setSelectedSlotStartsAt(slot.startsAt)}
                    type="button"
                  >
                    <span className="block font-semibold">{slot.localStartTime}</span>
                    <span className="text-xs opacity-75">
                      hasta {addMinutesToLocalTime(slot.localStartTime, booking.service.durationMinutes)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error ? (
          <p className="relative rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </section>

      <aside className="relative h-fit overflow-hidden rounded-2xl border border-[#e6d8c5] bg-[#fffcf6] p-6 shadow-sm">
        <CalendarGrid className="opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="relative space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7058]">Reserva actual</p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">{booking.business.name}</h2>
          </div>

          <div className="rounded-3xl bg-[#1e1b16] p-5 text-[#fffcf6]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#f2c66d]">Horario actual</p>
            <p className="font-display mt-2 text-4xl font-semibold leading-none tracking-tight">{booking.currentStartTime}</p>
            <p className="mt-2 text-sm text-[#d8cfc1]">hasta {booking.currentEndTime}</p>
          </div>

          <dl className="divide-y divide-dashed divide-[#d9c9b6] rounded-3xl border border-[#e6d8c5] bg-white/80 text-sm">
            <div className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3">
              <dt className="text-[#8a7058]">Servicio</dt>
              <dd className="text-right font-medium">{booking.service.name}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3">
              <dt className="text-[#8a7058]">Recurso</dt>
              <dd className="text-right font-medium">{booking.resource.name}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3">
              <dt className="text-[#8a7058]">Duración</dt>
              <dd className="text-right font-medium">{booking.service.durationMinutes} min</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3">
              <dt className="text-[#8a7058]">Zona</dt>
              <dd className="text-right font-medium">{booking.business.timezone}</dd>
            </div>
          </dl>

          <Button
            className="w-full bg-[#c85a2e] text-white hover:bg-[#a94722]"
            disabled={!selectedSlot || isSubmitting}
            onClick={handleSubmit}
            size="lg"
            type="button"
          >
            {isSubmitting ? "Reprogramando..." : "Confirmar nuevo horario"}
          </Button>
        </div>
      </aside>
    </div>
  )
}
