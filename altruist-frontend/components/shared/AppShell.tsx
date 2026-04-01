"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Header from "./Header"
import Footer from "./Footer"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideHeaderFooter =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/consultation/")

  if (hideHeaderFooter) {
    return (
      <main className="flex-1">
        {children}
      </main>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}
