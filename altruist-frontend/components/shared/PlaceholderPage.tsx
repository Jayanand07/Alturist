"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Construction, ChevronRight } from "lucide-react";
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: any;
}

export default function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full space-y-8"
        >
          <div className="flex justify-center">
            <div className="relative">
              <div className="bg-teal-50 p-8 rounded-[40px] text-[#0D9488] shadow-sm relative z-10">
                <Icon size={80} strokeWidth={1.5} />
              </div>
              <div className="absolute -top-4 -right-4 bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl text-xs font-bold border-2 border-white shadow-sm flex items-center gap-2">
                <Construction size={14} /> Coming Soon
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
              <span className="text-[#0D9488]">{title}</span> is on its way.
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
              {description} We're working hard to bring you the best experience for your healthcare needs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/">
              <Button className="h-12 px-8 font-bold bg-[#0D9488] hover:bg-[#0b7a6e] rounded-xl shadow-lg shadow-teal-500/10 transition-all active:scale-95 group flex items-center gap-2">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Button>
            </Link>
            <Link href="/consult">
              <Button variant="outline" className="h-12 px-8 font-bold border-gray-200 hover:border-[#0D9488] hover:bg-teal-50 rounded-xl transition-all flex items-center gap-2">
                Consult a Doctor
                <ChevronRight size={18} />
              </Button>
            </Link>
          </div>
          
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left opacity-60">
             <div className="space-y-2">
                <h4 className="font-bold text-gray-900">Secure Records</h4>
                <p className="text-xs font-medium">Your medical data is encrypted and always safe.</p>
             </div>
             <div className="space-y-2">
                <h4 className="font-bold text-gray-900">Expert Support</h4>
                <p className="text-xs font-medium">Our health assistants are available 24/7.</p>
             </div>
             <div className="space-y-2">
                <h4 className="font-bold text-gray-900">Verified Labs</h4>
                <p className="text-xs font-medium">Only NABL-certified partners for diagnostic tests.</p>
             </div>
          </div>
        </motion.div>
      </main>

      <footer className="py-8 px-6 border-t text-center font-medium text-gray-400 text-sm">
        <p>© 2026 Altruist Healthcare. Quality care. Any time.</p>
      </footer>
    </div>
  );
}
