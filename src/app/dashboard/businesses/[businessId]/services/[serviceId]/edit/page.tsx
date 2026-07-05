import Link from "next/link"
import { notFound } from "next/navigation"

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
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{business.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Editar servicio</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/businesses/${business.id}/services`}>Volver</Link>
        </Button>
      </div>

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
    </main>
  )
}
