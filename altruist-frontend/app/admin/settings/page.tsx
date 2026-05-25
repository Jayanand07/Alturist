"use client"

import React from "react"
import { Settings } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="bg-surface p-12 rounded-[40px] shadow-sm flex flex-col items-center justify-center text-center space-y-6">
      <div className="bg-surface-muted p-6 rounded-full text-muted-foreground">
        <Settings size={48} />
      </div>
      <h1 className="text-3xl font-black text-foreground tracking-tight">System Settings <span className="text-primary">Secure</span></h1>
      <p className="text-muted-foreground font-medium max-w-sm">Global platform configuration and security controls are currently under development.</p>
    </div>
  )
}
