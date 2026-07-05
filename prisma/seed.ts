import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

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

async function main() {
  for (const category of categories) {
    await prisma.businessCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
