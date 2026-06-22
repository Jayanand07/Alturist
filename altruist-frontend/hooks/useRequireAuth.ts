"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export function useRequireAuth() {
  const { user } = useAuth()
  const router = useRouter()

  return (action: () => void, redirectPath?: string) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(redirectPath || window.location.pathname)}`)
      return
    }
    action()
  }
}
