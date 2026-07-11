import Link from "next/link"

import { DashboardHero, DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { BusinessForm } from "@/features/businesses/business-form"
import {
  getBusinessCategories,
  requireBusinessOwnerSession,
} from "@/features/businesses/business.queries"

export default async function NewBusinessPage() {
  await requireBusinessOwnerSession()
  const categories = await getBusinessCategories()

  return (
    <DashboardShell size="md">
      <DashboardHero
        actions={(
          <Button asChild className="border-white/20 bg-white/10 text-[#fffcf6] hover:bg-white/20" variant="outline">
            <Link href="/dashboard/businesses">Volver</Link>
          </Button>
        )}
        description="Parte con los datos públicos del negocio. Después podrás agregar servicios, recursos y disponibilidad."
        eyebrow="Nuevo negocio"
        title="Crea tu negocio"
      />

      <BusinessForm categories={categories} />
    </DashboardShell>
  )
}
