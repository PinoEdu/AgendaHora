import Link from "next/link"
import { notFound } from "next/navigation"

import { DashboardHero, DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { ResourceForm } from "@/features/resources/resource-form"
import { getResourceForBusinessOwner } from "@/features/resources/resource.queries"
import { getActiveServicesForBusinessOwner } from "@/features/services/service.queries"

type EditResourcePageProps = {
  params: Promise<{
    businessId: string
    resourceId: string
  }>
}

export default async function EditResourcePage({ params }: EditResourcePageProps) {
  const { businessId, resourceId } = await params
  const session = await requireBusinessOwnerSession()
  const [business, resource, services] = await Promise.all([
    getBusinessForOwner(businessId, session.user.id),
    getResourceForBusinessOwner(businessId, resourceId, session.user.id),
    getActiveServicesForBusinessOwner(businessId, session.user.id),
  ])

  if (!business || !resource) {
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
        description="Actualiza tipo, servicios asociados y estado operativo del recurso."
        eyebrow={business.name}
        title="Editar recurso"
      />

      <ResourceForm
        businessId={business.id}
        services={services}
        values={{
          id: resource.id,
          name: resource.name,
          type: resource.type,
          description: resource.description ?? "",
          isActive: resource.isActive,
          serviceIds: resource.services.map((service) => service.serviceId),
        }}
      />
    </DashboardShell>
  )
}
