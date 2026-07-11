import Link from "next/link"
import { notFound } from "next/navigation"

import { DashboardHero, DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { ResourceForm } from "@/features/resources/resource-form"
import { getActiveServicesForBusinessOwner } from "@/features/services/service.queries"

type NewResourcePageProps = {
  params: Promise<{
    businessId: string
  }>
}

export default async function NewResourcePage({ params }: NewResourcePageProps) {
  const { businessId } = await params
  const session = await requireBusinessOwnerSession()
  const [business, services] = await Promise.all([
    getBusinessForOwner(businessId, session.user.id),
    getActiveServicesForBusinessOwner(businessId, session.user.id),
  ])

  if (!business) {
    notFound()
  }

  return (
    <DashboardShell size="md">
      <DashboardHero
        actions={(
          <Button asChild className="border-white/20 bg-white/10 text-[#fffcf6] hover:bg-white/20" variant="outline">
            <Link href={`/dashboard/businesses/${business.id}/resources`}>Volver</Link>
          </Button>
        )}
        description="Crea quién atiende, qué espacio se reserva o qué equipo tendrá horarios propios."
        eyebrow={business.name}
        title="Crear recurso"
      />

      <ResourceForm businessId={business.id} services={services} />
    </DashboardShell>
  )
}
