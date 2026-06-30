"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Header from "./Header"
import Footer from "./Footer"
import Sidebar from "./Sidebar"
import PageTransition from "@/components/motion/PageTransition"
import ScrollToTop from "./ScrollToTop"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register")
  const isAdmin = pathname?.startsWith("/admin")
  const isConsultation = pathname?.startsWith("/consultation/")

  // Dashboard routes that need sidebar but also header
  const isDashboard = pathname?.startsWith("/patient") || pathname?.startsWith("/doctor")

  if (isAuthPage || isAdmin || isConsultation) {
    return (
      <>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
        >
          Skip to content
        </a>
        <main id="main-content" tabIndex={-1} className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
      </>
    )
  }

  if (isDashboard) {
    return (
      <div className="flex flex-col min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
        >
          Skip to content
        </a>
        <Header />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />
          <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto w-full">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}