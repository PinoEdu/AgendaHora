import Link from "next/link"
import { notFound } from "next/navigation"

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
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{business.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Crear servicio</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/businesses/${business.id}/services`}>Volver</Link>
        </Button>
      </div>

      <ServiceForm businessId={business.id} />
    </main>
  )
}
