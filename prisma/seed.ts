import "dotenv/config"

import bcrypt from "bcrypt"
import { PrismaPg } from "@prisma/adapter-pg"
import { fromZonedTime } from "date-fns-tz"

import { PrismaClient } from "../src/generated/prisma/client"
import { BookingStatus, BusinessStatus, DayOfWeek, ResourceType, UserRole } from "../src/generated/prisma/enums"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const demoPassword = "Demo123456"
const demoTimezone = "America/Santiago"

const categories = [
  {
    name: "Barberias",
    slug: "barberias",
    description: "Cortes de pelo, afeitado y cuidado masculino.",
  },
  {
    name: "Peluquerias",
    slug: "peluquerias",
    description: "Servicios de cabello, coloracion y estilismo.",
  },
  {
    name: "Kinesiologia",
    slug: "kinesiologia",
    description: "Sesiones de rehabilitacion, terapia fisica y tratamiento corporal.",
  },
  {
    name: "Talleres mecanicos",
    slug: "talleres-mecanicos",
    description: "Mantenciones, diagnosticos y reparaciones vehiculares.",
  },
  {
    name: "Canchas",
    slug: "canchas",
    description: "Reserva de canchas y espacios deportivos.",
  },
  {
    name: "Dentistas",
    slug: "dentistas",
    description: "Atencion odontologica y controles dentales.",
  },
  {
    name: "Manicuristas",
    slug: "manicuristas",
    description: "Manicure, pedicure y cuidado de unas.",
  },
  {
    name: "Entrenadores personales",
    slug: "entrenadores-personales",
    description: "Sesiones de entrenamiento personal y preparacion fisica.",
  },
]

const weekdays = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
]

function minutesOfDay(hours: number, minutes = 0) {
  return hours * 60 + minutes
}

function addDaysToDateString(date: string, days: number) {
  const [year = "0", month = "1", day = "1"] = date.split("-")
  const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + days))

  return utcDate.toISOString().slice(0, 10)
}

function getDateValueFromToday(offsetDays: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + offsetDays)

  return date.toISOString().slice(0, 10)
}

function getDayOfWeekForDate(date: string) {
  const [year = "0", month = "1", day = "1"] = date.split("-")
  const utcDay = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).getUTCDay()
  const dayOfWeekByUtcDay = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ]

  return dayOfWeekByUtcDay[utcDay]
}

function findNextDateForDays(days: DayOfWeek[], startOffsetDays: number) {
  let candidate = getDateValueFromToday(startOffsetDays)

  for (let index = 0; index < 14; index += 1) {
    if (days.includes(getDayOfWeekForDate(candidate))) {
      return candidate
    }

    candidate = addDaysToDateString(candidate, 1)
  }

  return candidate
}

function findPreviousDateForDays(days: DayOfWeek[], startOffsetDays: number) {
  let candidate = getDateValueFromToday(startOffsetDays)

  for (let index = 0; index < 14; index += 1) {
    if (days.includes(getDayOfWeekForDate(candidate))) {
      return candidate
    }

    candidate = addDaysToDateString(candidate, -1)
  }

  return candidate
}

function localDateTimeToUtc(date: string, minutes: number, timezone: string) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const time = `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}:00`

  return fromZonedTime(`${date}T${time}`, timezone)
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

async function seedCategories() {
  for (const category of categories) {
    await prisma.businessCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }
}

async function seedDemoData() {
  const passwordHash = await bcrypt.hash(demoPassword, 12)
  const owner = await prisma.user.upsert({
    where: { email: "owner@agendahora.test" },
    update: {
      name: "Camila Rojas",
      passwordHash,
      role: UserRole.BUSINESS_OWNER,
    },
    create: {
      name: "Camila Rojas",
      email: "owner@agendahora.test",
      passwordHash,
      role: UserRole.BUSINESS_OWNER,
    },
  })
  const customer = await prisma.user.upsert({
    where: { email: "cliente@agendahora.test" },
    update: {
      name: "Diego Morales",
      passwordHash,
      role: UserRole.CUSTOMER,
    },
    create: {
      name: "Diego Morales",
      email: "cliente@agendahora.test",
      passwordHash,
      role: UserRole.CUSTOMER,
    },
  })
  const barberCategory = await prisma.businessCategory.findUniqueOrThrow({
    where: { slug: "barberias" },
  })

  await prisma.business.deleteMany({ where: { slug: "barberia-norte-demo" } })

  const business = await prisma.business.create({
    data: {
      ownerId: owner.id,
      categoryId: barberCategory.id,
      name: "Barberia Norte Demo",
      slug: "barberia-norte-demo",
      description:
        "Barberia de barrio con reservas online para cortes, barba y servicios combinados.",
      phone: "+56 9 1234 5678",
      email: "contacto@barberianorte.test",
      address: "Av. Providencia 1234",
      city: "Santiago",
      country: "CL",
      timezone: demoTimezone,
      status: BusinessStatus.ACTIVE,
    },
  })

  const haircut = await prisma.service.create({
    data: {
      businessId: business.id,
      name: "Corte clasico",
      description: "Corte con tijera y maquina, incluye peinado final.",
      durationMinutes: 30,
      price: "12000",
      isActive: true,
    },
  })
  const beard = await prisma.service.create({
    data: {
      businessId: business.id,
      name: "Perfilado de barba",
      description: "Perfilado con toalla caliente y terminacion con navaja.",
      durationMinutes: 30,
      price: "9000",
      isActive: true,
    },
  })
  const combo = await prisma.service.create({
    data: {
      businessId: business.id,
      name: "Corte + barba",
      description: "Servicio completo para renovar corte y barba en una sola visita.",
      durationMinutes: 60,
      price: "19000",
      isActive: true,
    },
  })

  const nico = await prisma.bookableResource.create({
    data: {
      businessId: business.id,
      name: "Nicolas",
      type: ResourceType.PROFESSIONAL,
      description: "Barbero especialista en cortes clasicos y degradados.",
      isActive: true,
    },
  })
  const vale = await prisma.bookableResource.create({
    data: {
      businessId: business.id,
      name: "Valentina",
      type: ResourceType.PROFESSIONAL,
      description: "Barbera especialista en barba, perfilado y servicios combinados.",
      isActive: true,
    },
  })

  await prisma.resourceService.createMany({
    data: [
      { resourceId: nico.id, serviceId: haircut.id },
      { resourceId: nico.id, serviceId: beard.id },
      { resourceId: nico.id, serviceId: combo.id },
      { resourceId: vale.id, serviceId: beard.id },
      { resourceId: vale.id, serviceId: combo.id },
    ],
    skipDuplicates: true,
  })

  await prisma.availabilityRule.createMany({
    data: [nico, vale].flatMap((resource) => [
      ...weekdays.map((dayOfWeek) => ({
        resourceId: resource.id,
        dayOfWeek,
        startMinute: minutesOfDay(9),
        endMinute: minutesOfDay(13),
        isActive: true,
      })),
      ...weekdays.map((dayOfWeek) => ({
        resourceId: resource.id,
        dayOfWeek,
        startMinute: minutesOfDay(15),
        endMinute: minutesOfDay(19),
        isActive: true,
      })),
      {
        resourceId: resource.id,
        dayOfWeek: DayOfWeek.SATURDAY,
        startMinute: minutesOfDay(10),
        endMinute: minutesOfDay(14),
        isActive: true,
      },
    ]),
  })

  const nextBusinessDate = findNextDateForDays(weekdays, 1)
  const secondBusinessDate = findNextDateForDays(weekdays, 2)
  const pastBusinessDate = findPreviousDateForDays(weekdays, -1)
  const nextBookingStart = localDateTimeToUtc(nextBusinessDate, minutesOfDay(10), demoTimezone)
  const pendingBookingStart = localDateTimeToUtc(nextBusinessDate, minutesOfDay(16), demoTimezone)
  const completedBookingStart = localDateTimeToUtc(pastBusinessDate, minutesOfDay(11), demoTimezone)

  await prisma.blockedTime.createMany({
    data: [
      {
        businessId: business.id,
        startsAt: localDateTimeToUtc(nextBusinessDate, minutesOfDay(13), demoTimezone),
        endsAt: localDateTimeToUtc(nextBusinessDate, minutesOfDay(15), demoTimezone),
        reason: "Bloqueo demo: descanso de almuerzo",
      },
      {
        businessId: business.id,
        resourceId: vale.id,
        startsAt: localDateTimeToUtc(secondBusinessDate, minutesOfDay(11), demoTimezone),
        endsAt: localDateTimeToUtc(secondBusinessDate, minutesOfDay(12), demoTimezone),
        reason: "Bloqueo demo: capacitacion interna",
      },
    ],
  })

  await prisma.booking.createMany({
    data: [
      {
        businessId: business.id,
        customerId: customer.id,
        serviceId: haircut.id,
        resourceId: nico.id,
        startsAt: nextBookingStart,
        endsAt: addMinutes(nextBookingStart, haircut.durationMinutes),
        status: BookingStatus.CONFIRMED,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: "+56 9 8765 4321",
        notes: "Reserva demo confirmada.",
      },
      {
        businessId: business.id,
        customerId: customer.id,
        serviceId: combo.id,
        resourceId: vale.id,
        startsAt: pendingBookingStart,
        endsAt: addMinutes(pendingBookingStart, combo.durationMinutes),
        status: BookingStatus.PENDING,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: "+56 9 8765 4321",
        notes: "Reserva demo pendiente.",
      },
      {
        businessId: business.id,
        customerId: customer.id,
        serviceId: beard.id,
        resourceId: nico.id,
        startsAt: completedBookingStart,
        endsAt: addMinutes(completedBookingStart, beard.durationMinutes),
        status: BookingStatus.COMPLETED,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: "+56 9 8765 4321",
        notes: "Reserva demo completada.",
      },
    ],
  })
}

async function main() {
  await seedCategories()
  await seedDemoData()
}

main()
  .then(async () => {
    console.log("Seed demo listo.")
    console.log("Dueno: owner@agendahora.test / Demo123456")
    console.log("Cliente: cliente@agendahora.test / Demo123456")
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
