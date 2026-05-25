"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Header from "./Header"
import Footer from "./Footer"
import Sidebar from "./Sidebar"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register")
  const isAdmin = pathname?.startsWith("/admin")
  const isConsultation = pathname?.startsWith("/consultation/")
  
  // Dashboard routes that need sidebar but also header
  const isDashboard = pathname?.startsWith("/patient") || pathname?.startsWith("/doctor")

  if (isAuthPage || isAdmin || isConsultation) {
    return (
      <main className="flex-1">
        {children}
      </main>
    )
  }

  if (isDashboard) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />
          <main className="flex-1 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
