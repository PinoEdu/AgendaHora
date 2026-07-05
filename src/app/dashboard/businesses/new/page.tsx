import Link from "next/link"

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
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Nuevo negocio</p>
          <h1 className="text-3xl font-semibold tracking-tight">Crea tu negocio</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/businesses">Volver</Link>
        </Button>
      </div>

      <BusinessForm categories={categories} />
    </main>
  )
}
