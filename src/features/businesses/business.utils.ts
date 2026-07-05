import { prisma } from "@/lib/prisma"

export function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function createUniqueBusinessSlug(name: string, excludeBusinessId?: string) {
  const baseSlug = createSlug(name) || "negocio"
  let slug = baseSlug
  let suffix = 2

  while (true) {
    const existingBusiness = await prisma.business.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!existingBusiness || existingBusiness.id === excludeBusinessId) {
      return slug
    }

    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }
}
