"use client"

import { useState } from "react"

import { CalendarGrid } from "@/components/ui/calendar-grid"
import { cn } from "@/lib/utils"

const services = [
  { id: "haircut", name: "Corte clasico", duration: "30 min", price: "$12.000" },
  { id: "combo", name: "Corte + barba", duration: "60 min", price: "$19.000" },
]

const professionals = [
  { id: "nico", name: "Nicolas", specialty: "Cortes clasicos" },
  { id: "vale", name: "Valentina", specialty: "Barba y perfilado" },
]

const slots = ["09:30", "10:00", "10:30"]

export function InteractiveBookingPreview() {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "")
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(professionals[0]?.id ?? "")
  const [selectedSlot, setSelectedSlot] = useState(slots[1] ?? "")
  const [activeStep, setActiveStep] = useState("service")

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0]
  const selectedProfessional =
    professionals.find((professional) => professional.id === selectedProfessionalId) ?? professionals[0]

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-5 shadow-[0_24px_80px_rgba(66,48,28,0.12)]">
      <CalendarGrid />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-3xl bg-[#1e1b16] p-5 text-[#fffcf6]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#f2c66d]">Prueba el flujo</p>
            <h2 className="mt-3 text-2xl font-semibold">Reserva en 3 pasos</h2>
            <p className="mt-1 text-sm text-[#d8cfc1]">Cambia las opciones y mira como queda el comprobante.</p>
          </div>
          <span className="rounded-full bg-[#f2c66d] px-3 py-1 text-xs font-semibold text-[#1e1b16]">
            Demo
          </span>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-3">
          {[
            ["service", "Servicio"],
            ["professional", "Profesional"],
            ["time", "Horario"],
          ].map(([id, label]) => (
            <button
              className={cn(
                "rounded-2xl border px-3 py-2 text-left font-medium transition-colors",
                activeStep === id
                  ? "border-[#1e1b16] bg-[#1e1b16] text-[#fffcf6]"
                  : "border-[#e6d8c5] bg-white text-[#655b4f] hover:bg-[#fff8eb]",
              )}
              key={id}
              onClick={() => setActiveStep(id)}
              onFocus={() => setActiveStep(id)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          <section className="rounded-3xl border border-[#e6d8c5] bg-[#fff8eb]/95 p-4">
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
                    setSelectedServiceId(service.id)
                    setActiveStep("professional")
                  }}
                  onFocus={() => setActiveStep("service")}
                  type="button"
                >
                  {service.name}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#e6d8c5] bg-[#fffcf6]/95 p-4">
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
                    setSelectedProfessionalId(professional.id)
                    setActiveStep("time")
                  }}
                  onFocus={() => setActiveStep("professional")}
                  type="button"
                >
                  {professional.name}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#e6d8c5] bg-[#fff8eb]/95 p-4">
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
                    setSelectedSlot(slot)
                    setActiveStep("confirm")
                  }}
                  onFocus={() => setActiveStep("time")}
                  type="button"
                >
                  {slot}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="rounded-3xl border border-[#e6d8c5] bg-white/95 p-4">
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
