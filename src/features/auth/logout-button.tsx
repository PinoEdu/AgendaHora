import { Button } from "@/components/ui/button"

import { logoutAction } from "./auth.actions"

type LogoutButtonProps = {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <Button className={className} type="submit" variant="outline">
        Cerrar sesión
      </Button>
    </form>
  )
}
