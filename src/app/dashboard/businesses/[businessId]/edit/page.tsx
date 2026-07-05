import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { BusinessForm } from "@/features/businesses/business-form"
import {
  getBusinessCategories,
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"

type EditBusinessPageProps = {
  params: Promise<{
    businessId: string
  }>
}

export default async function EditBusinessPage({ params }: EditBusinessPageProps) {
  const { businessId } = await params
  const session = await requireBusinessOwnerSession()
  const [business, categories] = await Promise.all([
    getBusinessForOwner(businessId, session.user.id),
    getBusinessCategories(),
  ])

  if (!business) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Editar negocio</p>
          <h1 className="text-3xl font-semibold tracking-tight">{business.name}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
        </Button>
      </div>

      <BusinessForm
        categories={categories}
        values={{
          id: business.id,
          name: business.name,
          categoryId: business.categoryId,
          description: business.description ?? "",
          phone: business.phone ?? "",
          email: business.email ?? "",
          address: business.address ?? "",
          city: business.city ?? "",
          country: business.country ?? "CL",
          timezone: business.timezone,
          status: business.status,
        }}
      />
    </main>
  )
}
