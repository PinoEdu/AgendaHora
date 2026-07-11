import Link from "next/link"
import { notFound } from "next/navigation"

import { DashboardHero, DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import {
  getBusinessForOwner,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"
import { ServiceForm } from "@/features/services/service-form"
import { getServiceForBusinessOwner } from "@/features/services/service.queries"

type EditServicePageProps = {
  params: Promise<{
    businessId: string
    serviceId: string
  }>
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { businessId, serviceId } = await params
  const session = await requireBusinessOwnerSession()
  const [business, service] = await Promise.all([
    getBusinessForOwner(businessId, session.user.id),
    getServiceForBusinessOwner(businessId, serviceId, session.user.id),
  ])

  if (!business || !service) {
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
        description="Ajusta precio, duración o estado del servicio sin cambiar las reservas existentes."
        eyebrow={business.name}
        title="Editar servicio"
      />

      <ServiceForm
        businessId={business.id}
        values={{
          id: service.id,
          name: service.name,
          description: service.description ?? "",
          durationMinutes: service.durationMinutes,
          price: service.price.toString(),
          isActive: service.isActive,
        }}
      />
    </DashboardShell>
  )
}
