import Link from "next/link"
import { notFound } from "next/navigation"

import { DashboardHero, DashboardShell } from "@/components/dashboard/dashboard-shell"
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
    <DashboardShell size="md">
      <DashboardHero
        actions={(
          <Button asChild className="border-white/20 bg-white/10 text-[#fffcf6] hover:bg-white/20" variant="outline">
            <Link href={`/dashboard/businesses/${business.id}`}>Volver</Link>
          </Button>
        )}
        description="Actualiza la información pública y el estado operativo del negocio."
        eyebrow="Editar negocio"
        title={business.name}
      />

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
    </DashboardShell>
  )
}
