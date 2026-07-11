import Link from "next/link"
import { notFound } from "next/navigation"

import { DashboardHero, DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { ServiceForm } from "@/features/services/service-form"

type NewServicePageProps = {
  params: Promise<{
    businessId: string
  }>
}

export default async function NewServicePage({ params }: NewServicePageProps) {
  const { businessId } = await params
  const session = await requireBusinessOwnerSession()
  const business = await getBusinessForOwner(businessId, session.user.id)

  if (!business) {
    notFound()
  }

  return (
    <DashboardShell size="md">
      <DashboardHero
        actions={(
          <Button asChild className="border-white/20 bg-white/10 text-[#fffcf6] hover:bg-white/20" variant="outline">
            <Link href={`/dashboard/businesses/${business.id}/services`}>Volver</Link>
          </Button>
        )}
        description="Define duración, precio y descripción del servicio antes de asociarlo a recursos."
        eyebrow={business.name}
        title="Crear servicio"
      />

      <ServiceForm businessId={business.id} />
    </DashboardShell>
  )
}
