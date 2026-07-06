import Link from "next/link"

import { getSafeCallbackUrl } from "@/features/auth/auth-redirects"
import { LoginForm } from "@/features/auth/login-form"

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string
    registered?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, registered } = await searchParams
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl)

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <Link className="text-sm font-semibold tracking-tight" href="/">
            AgendaHora
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Ingresa a tu cuenta</h1>
          <p className="text-sm text-muted-foreground">
            Administra reservas o agenda servicios en negocios locales.
          </p>
        </div>
        <LoginForm callbackUrl={safeCallbackUrl} registered={registered === "1"} />
      </div>
    </main>
  )
}
