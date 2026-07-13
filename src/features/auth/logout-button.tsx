"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"

import { logoutAction } from "./auth.actions"

type LogoutButtonProps = {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isConfirming) {
      return
    }

    cancelButtonRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsConfirming(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isConfirming])

  return (
    <>
      <Button className={className} onClick={() => setIsConfirming(true)} type="button" variant="outline">
        Cerrar sesión
      </Button>

      {isConfirming
        ? createPortal(
            <div
              aria-labelledby="logout-dialog-title"
              aria-modal="true"
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm"
              onClick={() => setIsConfirming(false)}
              role="dialog"
            >
              <div
                className="w-full max-w-sm rounded-[2rem] border border-[#e6d8c5] bg-[#fffcf6] p-5 text-[#1e1b16] shadow-[0_24px_80px_rgba(30,27,22,0.24)]"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 className="font-display text-2xl font-semibold tracking-[-0.035em]" id="logout-dialog-title">
                  ¿Cerrar sesión?
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#655b4f]">
                  Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
                </p>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    className="border-[#d6c7b5] bg-white"
                    onClick={() => setIsConfirming(false)}
                    ref={cancelButtonRef}
                    type="button"
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <form action={logoutAction}>
                    <Button className="w-full bg-[#c85a2e] text-white hover:bg-[#a94722] sm:w-auto" type="submit">
                      Cerrar sesión
                    </Button>
                  </form>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
