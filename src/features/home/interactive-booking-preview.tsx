"use client"

import { useEffect, useRef, useState } from "react"

import { CalendarGrid } from "@/components/ui/calendar-grid"
import { cn } from "@/lib/utils"

const services = [
  { id: "haircut", name: "Corte clásico", duration: "30 min", price: "$12.000" },
  { id: "combo", name: "Corte + barba", duration: "60 min", price: "$19.000" },
]

const professionals = [
  { id: "nico", name: "Nicolás", specialty: "Cortes clásicos" },
  { id: "vale", name: "Valentina", specialty: "Barba y perfilado" },
]

const slots = ["09:30", "10:00", "10:30"]

const autoAdvanceMs = 1800
const userPauseMs = 6500

const demoFrames = [
  { activeStep: "service", professionalId: "nico", serviceId: "haircut", slot: "09:30" },
  { activeStep: "professional", professionalId: "nico", serviceId: "combo", slot: "09:30" },
  { activeStep: "time", professionalId: "vale", serviceId: "combo", slot: "09:30" },
  { activeStep: "confirm", professionalId: "vale", serviceId: "combo", slot: "10:30" },
  { activeStep: "service", professionalId: "vale", serviceId: "combo", slot: "10:30" },
  { activeStep: "professional", professionalId: "vale", serviceId: "haircut", slot: "10:30" },
  { activeStep: "time", professionalId: "nico", serviceId: "haircut", slot: "10:30" },
  { activeStep: "confirm", professionalId: "nico", serviceId: "haircut", slot: "10:00" },
] as const

type DemoStep = (typeof demoFrames)[number]["activeStep"]

const steps: Array<{ id: Exclude<DemoStep, "confirm">; label: string }> = [
  { id: "service", label: "Servicio" },
  { id: "professional", label: "Profesional" },
  { id: "time", label: "Horario" },
]

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener("change", updatePreference)

    return () => mediaQuery.removeEventListener("change", updatePreference)
  }, [])

  return prefersReducedMotion
}

export function InteractiveBookingPreview() {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "")
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(professionals[0]?.id ?? "")
  const [selectedSlot, setSelectedSlot] = useState(slots[1] ?? "")
  const [activeStep, setActiveStep] = useState<DemoStep>("service")
  const [, setFrameIndex] = useState(0)
  const [isUserPaused, setIsUserPaused] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const pauseTimeoutRef = useRef<number | null>(null)

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0]
  const selectedProfessional =
    professionals.find((professional) => professional.id === selectedProfessionalId) ?? professionals[0]
  const isAutoRunning = !prefersReducedMotion && !isUserPaused

  useEffect(() => {
    if (!isAutoRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      setFrameIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % demoFrames.length
        const nextFrame = demoFrames[nextIndex]

        setSelectedServiceId(nextFrame.serviceId)
        setSelectedProfessionalId(nextFrame.professionalId)
        setSelectedSlot(nextFrame.slot)
        setActiveStep(nextFrame.activeStep)

        return nextIndex
      })
    }, autoAdvanceMs)

    return () => window.clearInterval(intervalId)
  }, [isAutoRunning])

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        window.clearTimeout(pauseTimeoutRef.current)
      }
    }
  }, [])

  function pauseAutoplay() {
    if (prefersReducedMotion) {
      return
    }

    setIsUserPaused(true)

    if (pauseTimeoutRef.current) {
      window.clearTimeout(pauseTimeoutRef.current)
    }

    pauseTimeoutRef.current = window.setTimeout(() => {
      setIsUserPaused(false)
      pauseTimeoutRef.current = null
    }, userPauseMs)
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-5 shadow-[0_24px_80px_rgba(66,48,28,0.12)] transition-transform duration-300 hover:-translate-y-1">
      <CalendarGrid />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-3xl bg-[#1e1b16] p-5 text-[#fffcf6]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#f2c66d]">Flujo</p>
            <h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.035em]">Reserva en 3 pasos</h2>
            {/* <p className="mt-1 text-sm text-[#d8cfc1]">Cambia las opciones y mira como queda el comprobante.</p> */}
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f2c66d] px-3 py-1 text-xs font-semibold text-[#1e1b16]">
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 rounded-full",
                isAutoRunning ? "animate-pulse bg-emerald-600" : "bg-[#8a6240]",
              )}
            />
            {prefersReducedMotion ? "Manual" : isUserPaused ? "Pausado" : "Auto demo"}
          </span>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-3">
          {steps.map(({ id, label }) => (
            <button
              className={cn(
                "relative overflow-hidden rounded-2xl border px-3 py-2 text-left font-medium transition-all duration-300",
                activeStep === id
                  ? "-translate-y-0.5 border-[#1e1b16] bg-[#1e1b16] text-[#fffcf6] shadow-lg"
                  : "border-[#e6d8c5] bg-white text-[#655b4f] hover:bg-[#fff8eb]",
              )}
              key={id}
              onClick={() => {
                pauseAutoplay()
                setActiveStep(id)
              }}
              onFocus={() => {
                pauseAutoplay()
                setActiveStep(id)
              }}
              type="button"
            >
              {activeStep === id ? <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-[#f2c66d]" /> : null}
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          <section
            className={cn(
              "rounded-3xl border border-[#e6d8c5] bg-[#fff8eb]/95 p-4 transition-all duration-300",
              activeStep === "service" ? "-translate-y-0.5 border-[#c85a2e] shadow-[0_16px_34px_rgba(200,90,46,0.14)]" : null,
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Servicio</p>
                <p className="mt-1 font-semibold">{selectedService?.name}</p>
              </div>
              <p className="text-right text-sm font-medium text-[#655b4f]">
                {selectedService?.duration}
                <br />
                {selectedService?.price}
              </p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {services.map((service) => (
                <button
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-left text-sm transition-colors",
                    selectedServiceId === service.id
                      ? "border-[#c85a2e] bg-[#c85a2e] text-white"
                      : "border-[#eadccb] bg-white text-[#655b4f] hover:bg-[#fff0d2]",
                  )}
                  key={service.id}
                  onClick={() => {
                    pauseAutoplay()
                    setSelectedServiceId(service.id)
                    setActiveStep("professional")
                  }}
                  onFocus={() => {
                    pauseAutoplay()
                    setActiveStep("service")
                  }}
                  type="button"
                >
                  {service.name}
                </button>
              ))}
            </div>
          </section>

          <section
            className={cn(
              "rounded-3xl border border-[#e6d8c5] bg-[#fffcf6]/95 p-4 transition-all duration-300",
              activeStep === "professional" ? "-translate-y-0.5 border-[#1e1b16] shadow-[0_16px_34px_rgba(30,27,22,0.12)]" : null,
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Profesional</p>
                <p className="mt-1 font-semibold">{selectedProfessional?.name}</p>
              </div>
              <p className="text-right text-sm text-[#655b4f]">{selectedProfessional?.specialty}</p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {professionals.map((professional) => (
                <button
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-left text-sm transition-colors",
                    selectedProfessionalId === professional.id
                      ? "border-[#1e1b16] bg-[#1e1b16] text-[#fffcf6]"
                      : "border-[#eadccb] bg-white text-[#655b4f] hover:bg-[#fff0d2]",
                  )}
                  key={professional.id}
                  onClick={() => {
                    pauseAutoplay()
                    setSelectedProfessionalId(professional.id)
                    setActiveStep("time")
                  }}
                  onFocus={() => {
                    pauseAutoplay()
                    setActiveStep("professional")
                  }}
                  type="button"
                >
                  {professional.name}
                </button>
              ))}
            </div>
          </section>

          <section
            className={cn(
              "rounded-3xl border border-[#e6d8c5] bg-[#fff8eb]/95 p-4 transition-all duration-300",
              activeStep === "time" ? "-translate-y-0.5 border-[#c85a2e] shadow-[0_16px_34px_rgba(200,90,46,0.14)]" : null,
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Disponibilidad de hoy</p>
                <p className="mt-1 font-semibold">Horarios visibles antes de reservar.</p>
              </div>
              <span className="rounded-full bg-[#c85a2e] px-3 py-1 text-xs font-semibold text-white">
                Online
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-medium">
              {slots.map((slot) => (
                <button
                  className={cn(
                    "rounded-xl px-3 py-2 transition-colors",
                    selectedSlot === slot
                      ? "bg-[#1e1b16] text-white"
                      : "bg-white text-[#655b4f] hover:bg-[#fff0d2]",
                  )}
                  key={slot}
                  onClick={() => {
                    pauseAutoplay()
                    setSelectedSlot(slot)
                    setActiveStep("confirm")
                  }}
                  onFocus={() => {
                    pauseAutoplay()
                    setActiveStep("time")
                  }}
                  type="button"
                >
                  {slot}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div
          aria-live="polite"
          className={cn(
            "rounded-3xl border border-[#e6d8c5] bg-white/95 p-4 transition-all duration-300",
            activeStep === "confirm" ? "-translate-y-0.5 border-emerald-300 shadow-[0_16px_34px_rgba(16,185,129,0.14)]" : null,
          )}
        >
          <p className="text-xs uppercase tracking-[0.18em] text-[#8a7058]">Comprobante</p>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-[#8a7058]">Servicio</p>
              <p className="font-semibold">{selectedService?.name}</p>
            </div>
            <div>
              <p className="text-[#8a7058]">Con</p>
              <p className="font-semibold">{selectedProfessional?.name}</p>
            </div>
            <div>
              <p className="text-[#8a7058]">Hora</p>
              <p className="font-semibold">{selectedSlot}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
