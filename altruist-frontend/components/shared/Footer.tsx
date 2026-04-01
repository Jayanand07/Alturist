"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Twitter, Instagram, Facebook, Linkedin, ShieldCheck } from "lucide-react"

export default function Footer() {
  const footerSections = [
    {
      title: "Our Services",
      links: [
        { label: "Consult Doctors", href: "/consult" },
        { label: "Diagnostic Tests", href: "/labs" },
        { label: "Order Medicines", href: "/medicines" },
        { label: "Health Plans", href: "/plans" },
        { label: "Lab Tests", href: "/labs" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Blog", href: "/blog" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Refund Policy", href: "/refund" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  ]

  return (
    <footer className="bg-[#1a1a2e] text-white pt-[60px] pb-[60px] px-8 md:px-12 font-sans border-t border-white/5">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16">
          {/* Column 1 - Brand */}
          <div className="flex flex-col space-y-6">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <Image 
                src="/logo.png" 
                alt="Altruist" 
                width={120} 
                height={40} 
                style={{ height: 'auto', filter: 'brightness(10)' }} 
                className="object-contain"
              />
            </Link>
            <p className="text-gray-400 text-[15px] font-medium leading-relaxed max-w-[240px]">
              Instant Healthcare. Anytime. Anywhere. Making healthcare affordable and accessible.
            </p>
            <div className="flex items-center gap-5 pt-2">
              {[
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map((social, idx) => (
                <Link key={idx} href={social.href} className="text-gray-400 hover:text-teal-400 transition-all transform hover:-translate-y-1">
                  <social.icon size={22} strokeWidth={1.5} />
                </Link>
              ))}
            </div>
            <p className="text-gray-500 text-xs font-semibold tracking-wide uppercase pt-4">
              © 2026 Altruist Healthcare. All rights reserved.
            </p>
          </div>

          {/* Other Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col space-y-6">
              <h3 className="text-[17px] font-extrabold text-white tracking-tight uppercase">
                {section.title}
              </h3>
              <ul className="flex flex-col space-y-3.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-teal-400 transition-colors text-sm font-semibold tracking-tight"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-gray-500 text-sm italic font-medium">
             <ShieldCheck className="text-teal-500/50" size={18} />
             <span>Licensed healthcare platform. Not a substitute for professional medical advice.</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex -space-x-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-6 w-10 border border-white/10 rounded bg-white/5 flex items-center justify-center text-[8px] font-bold text-gray-600">
                    PAY
                  </div>
                ))}
             </div>
             <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase">Verified Secure</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
