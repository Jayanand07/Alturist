"use client"

import React from "react"
import { Settings } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="bg-white p-12 rounded-[40px] shadow-sm flex flex-col items-center justify-center text-center space-y-6">
      <div className="bg-gray-100 p-6 rounded-full text-gray-700">
        <Settings size={48} />
      </div>
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings <span className="text-teal-600">Secure</span></h1>
      <p className="text-gray-500 font-medium max-w-sm">Global platform configuration and security controls are currently under development.</p>
    </div>
  )
}
