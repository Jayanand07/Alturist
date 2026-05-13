"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin, Search, ShoppingCart, User, Menu, ChevronDown, LogOut,
  Settings, ClipboardList, Package, LayoutDashboard, HeartPulse, X,
  Globe, Video, Bell, Stethoscope, FlaskConical, Pill, CreditCard,
  Building2, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// ── Services dropdown items ────────────────────────────────────────────────
const SERVICES = [
  { label: "Consult Doctors",  href: "/consult",     icon: Stethoscope, desc: "Instant video consultation"  },
  { label: "Find Clinics",     href: "/clinics",     icon: Building2,   desc: "In-person appointments"       },
  { label: "Order Medicines",  href: "/medicines",   icon: Pill,        desc: "Delivered to your door"       },
  { label: "Diagnostic Tests", href: "/labs",        icon: FlaskConical,desc: "Lab reports in 24h"           },
  { label: "Health Plans",     href: "/plans",       icon: CreditCard,  desc: "Affordable subscriptions"     },
];

// ── Top-level nav links (non-Services) ────────────────────────────────────
const NAV_LINKS = [
  { title: "Plans",    href: "/plans" },
  { title: "About Us", href: "/about" },
];

const RESOURCES = [
  { label: "Doctor Vlogs", href: "/vlogs",   icon: Video,     desc: "Health tips from experts" },
  { label: "Find Clinics", href: "/clinics", icon: Building2, desc: "In-person appointments"  },
];

export default function Header() {
  const pathname          = usePathname();
  const { user, signOut } = useAuth();
  const [isSticky,       setIsSticky]       = useState(false);
  const [isSearchOpen,   setIsSearchOpen]   = useState(false);
  const [servicesOpen,   setServicesOpen]   = useState(false);
  const [resourcesOpen,  setResourcesOpen]  = useState(false);
  const servicesRef                         = useRef<HTMLDivElement>(null);
  const resourcesRef                        = useRef<HTMLDivElement>(null);
  const { getTotalItems }                   = useCartStore();
  const cartCount                           = getTotalItems();

  // Scroll → sticky
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close Services dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // All mobile nav links (flat)
  const allMobileLinks = [
    ...SERVICES.map(s => ({ title: s.label, href: s.href })),
    ...NAV_LINKS,
  ];

  // User type helper
  const userType = (user as any)?.userType as string | undefined;

  return (
    <header className="w-full flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-[#00A87E] text-white py-2 px-4 md:px-8 flex justify-between items-center text-xs font-medium tracking-tight overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-90">
          <div className="flex items-center bg-white/15 rounded-full px-3 py-1 gap-1.5 backdrop-blur-sm border border-white/10">
            <MapPin size={12} className="text-white/80" />
            <span className="truncate max-w-[120px] md:max-w-none">Amritsar, Punjab</span>
            <ChevronDown size={10} className="text-white/60" />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors">
            <Globe size={12} />
            <span className="opacity-80">Language:</span>
            <span className="font-bold">EN</span>
            <ChevronDown size={10} className="opacity-60" />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={cn(
        "bg-white border-b border-[#E2E8F0] transition-all duration-300 z-50 px-4 md:px-8 py-3 flex items-center justify-between",
        isSticky ? "fixed top-0 left-0 w-full shadow-lg shadow-black/5 h-[72px]" : "relative h-[76px]"
      )}>
        {/* Left: Logo & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {/* Mobile Hamburger */}
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu size={24} />
              </Button>
            } />
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <SheetHeader className="mb-8">
                <SheetTitle className="flex items-center gap-2">
                  <HeartPulse className="w-8 h-8 text-[#00A87E]" />
                  <span className="font-heading text-2xl font-extrabold text-[#0F172A] tracking-tight">ALTRUIST</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1">
                {/* Services section in mobile */}
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Services</p>
                {SERVICES.map(s => (
                  <Link key={s.href} href={s.href}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3",
                      isActive(s.href) ? "bg-[#E6F7F3] text-[#00A87E]" : "text-[#475569] hover:bg-[#F8FAFC]"
                    )}>
                    <s.icon size={16} className={isActive(s.href) ? "text-[#00A87E]" : "text-[#94A3B8]"} />
                    {s.label}
                  </Link>
                ))}
                <div className="my-3 border-t border-[#F1F5F9]" />
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Resources</p>
                {RESOURCES.map(r => (
                  <Link key={r.href} href={r.href}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3",
                      isActive(r.href) ? "bg-[#E6F7F3] text-[#00A87E]" : "text-[#475569] hover:bg-[#F8FAFC]"
                    )}>
                    <r.icon size={16} className={isActive(r.href) ? "text-[#00A87E]" : "text-[#94A3B8]"} />
                    {r.label}
                  </Link>
                ))}
                <div className="my-3 border-t border-[#F1F5F9]" />
                {NAV_LINKS.map(link => (
                  <Link key={link.title} href={link.href}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                      isActive(link.href) ? "bg-[#E6F7F3] text-[#00A87E]" : "text-[#475569] hover:bg-[#F8FAFC]"
                    )}>
                    {link.title}
                  </Link>
                ))}
                {/* Auth in mobile drawer */}
                {!user && (
                  <>
                    <div className="my-3 border-t border-[#F1F5F9]" />
                    <Link href="/login">
                      <Button variant="outline" className="w-full font-bold border-[#E2E8F0] text-[#475569] mb-2">Log In</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full font-bold bg-[#00A87E] hover:bg-[#007A5C]">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <HeartPulse className="w-8 h-8 text-[#00A87E]" />
            <span className="font-heading text-xl font-extrabold text-[#0F172A] tracking-tight hidden sm:block">ALTRUIST</span>
          </Link>
        </div>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Services Dropdown */}
          <div ref={servicesRef} className="relative">
            <button
              id="services-menu-btn"
              onClick={() => setServicesOpen(o => !o)}
              className={cn(
                "flex items-center gap-1 py-1 text-[15px] font-semibold transition-colors hover:text-[#00A87E]",
                SERVICES.some(s => isActive(s.href))
                  ? "text-[#00A87E]"
                  : "text-[#475569]"
              )}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              Services
              <ChevronDown size={15} className={cn("transition-transform duration-200", servicesOpen && "rotate-180")} />
            </button>

            {/* Services mega-dropdown */}
            {servicesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[340px] bg-white rounded-2xl border border-[#E2E8F0] shadow-xl shadow-black/8 p-2 z-50">
                {/* Triangle arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
                  <div className="w-3 h-3 bg-white border-l border-t border-[#E2E8F0] rotate-45 translate-y-1 translate-x-0.5" />
                </div>
                {SERVICES.map(s => (
                  <Link key={s.href} href={s.href}
                    onClick={() => setServicesOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                      isActive(s.href)
                        ? "bg-[#E6F7F3] text-[#00A87E]"
                        : "hover:bg-[#F8FAFC] text-[#475569]"
                    )}>
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                      isActive(s.href) ? "bg-[#00A87E]/10" : "bg-[#F1F5F9] group-hover:bg-[#E6F7F3]"
                    )}>
                      <s.icon size={17} className={isActive(s.href) ? "text-[#00A87E]" : "text-[#64748B] group-hover:text-[#00A87E]"} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm">{s.label}</span>
                      <span className="text-xs text-[#94A3B8]">{s.desc}</span>
                    </div>
                    {isActive(s.href) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00A87E] flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Regular nav links */}
          {NAV_LINKS.map(link => (
            <Link key={link.title} href={link.href}
              className={cn(
                "relative py-1 text-[15px] font-semibold transition-colors hover:text-[#00A87E]",
                isActive(link.href)
                  ? "text-[#00A87E] after:absolute after:bottom-[-26px] after:left-0 after:w-full after:h-[3px] after:bg-[#00A87E] after:rounded-t-full"
                  : "text-[#475569]"
              )}>
              {link.title}
            </Link>
          ))}

          {/* Resources Dropdown */}
          <div ref={resourcesRef} className="relative">
            <button
              onClick={() => setResourcesOpen(o => !o)}
              className={cn(
                "flex items-center gap-1 py-1 text-[15px] font-semibold transition-colors hover:text-[#00A87E]",
                RESOURCES.some(r => isActive(r.href)) ? "text-[#00A87E]" : "text-[#475569]"
              )}
            >
              Resources
              <ChevronDown size={15} className={cn("transition-transform duration-200", resourcesOpen && "rotate-180")} />
            </button>

            {resourcesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[280px] bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-2 z-50">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
                  <div className="w-3 h-3 bg-white border-l border-t border-[#E2E8F0] rotate-45 translate-y-1 translate-x-0.5" />
                </div>
                {RESOURCES.map(r => (
                  <Link key={r.href} href={r.href} onClick={() => setResourcesOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                      isActive(r.href) ? "bg-[#E6F7F3] text-[#00A87E]" : "hover:bg-[#F8FAFC] text-[#475569]"
                    )}>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                      isActive(r.href) ? "bg-[#00A87E]/10" : "bg-[#F1F5F9] group-hover:bg-[#E6F7F3]"
                    )}>
                      <r.icon size={15} className={isActive(r.href) ? "text-[#00A87E]" : "text-[#64748B] group-hover:text-[#00A87E]"} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{r.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Search, Notification Bell, Cart, Auth */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search Bar */}
          <div className={cn("relative transition-all duration-300", isSearchOpen ? "w-[250px] md:w-[300px]" : "w-10 lg:w-[220px]")}>
            <Input
              placeholder="Search health products..."
              className={cn("pl-11 h-11 border-[#E2E8F0] focus:border-[#00A87E] transition-all bg-[#F8FAFC] rounded-full", !isSearchOpen && "hidden lg:flex")}
            />
            <Button variant="ghost" size="icon"
              className={cn("absolute left-1 top-1 rounded-full hover:bg-transparent", !isSearchOpen && "lg:left-1")}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search">
              <Search className={cn("w-5 h-5 text-[#475569]", isSearchOpen && "text-[#00A87E]")} />
            </Button>
            {isSearchOpen && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1 rounded-full md:hidden"
                onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                <X className="w-4 h-4 text-[#475569]" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Support icon — for logged-in users */}
            {user && (
              <Link href="/support">
                <Button variant="ghost" size="icon" className="hover:bg-[#E6F7F3] transition-colors h-11 w-11 rounded-full group">
                  <MessageSquare className="w-5 h-5 text-[#475569] group-hover:text-[#00A87E]" />
                </Button>
              </Link>
            )}

            {/* Notification Bell — only for logged-in users */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="relative hover:bg-[#E6F7F3] transition-colors h-11 w-11 rounded-full group"
              >
                <Bell className="w-5 h-5 text-[#475569] group-hover:text-[#00A87E]" />
                {/* Unread indicator dot — static placeholder */}
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6B35] border-2 border-white" />
              </Button>
            )}

            {/* Cart Icon */}
            <Link href="/cart" aria-label={`Cart (${cartCount} items)`}>
              <Button variant="ghost" size="icon" className="relative hover:bg-[#E6F7F3] transition-colors h-11 w-11 rounded-full group">
                <ShoppingCart className="w-5 h-5 text-[#475569] group-hover:text-[#00A87E]" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-[#FF6B35] hover:bg-[#FF6B35] border-2 border-white">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth: Avatar dropdown OR Login/Register */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center gap-2 pl-2">
                    <Avatar className="h-9 w-9 border-2 border-[#E2E8F0] hover:border-[#00A87E] transition-colors">
                      <AvatarImage src={(user as any).photoURL || ""} />
                      <AvatarFallback className="bg-[#E6F7F3] text-[#00A87E] font-bold text-sm">
                        {(user.displayName?.charAt(0) || user.email?.charAt(0) || "A").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown size={14} className="text-[#475569] hidden sm:block" />
                  </Button>
                } />
                <DropdownMenuContent align="end" className="w-64 p-2 mt-2 rounded-2xl border-[#E2E8F0] shadow-xl">
                  {/* User info header */}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="mb-1 px-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#0F172A]">{user.displayName || "Altruist User"}</span>
                        <span className="text-xs font-medium text-[#475569] truncate">{user.email}</span>
                        {userType && (
                          <span className={cn(
                            "mt-1 inline-flex items-center self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            userType === "DOCTOR" ? "bg-blue-50 text-blue-600" :
                            userType === "SUPER_ADMIN" ? "bg-purple-50 text-purple-600" :
                            "bg-[#E6F7F3] text-[#00A87E]"
                          )}>
                            {userType}
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* Navigation items */}
                  <DropdownMenuGroup>
                    {/* My Dashboard */}
                    <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-[#F8FAFC]">
                      <Link href={userType === "DOCTOR" ? "/doctor" : userType === "SUPER_ADMIN" ? "/admin/dashboard" : "/patient"}
                        className="flex items-center gap-3 w-full">
                        <LayoutDashboard size={16} className="text-[#475569]" />
                        <span className="text-sm font-semibold text-[#0F172A]">My Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Patient-only: My Appointments */}
                    {(!userType || userType === "PATIENT") && (
                      <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-[#F8FAFC]">
                        <Link href="/patient/appointments" className="flex items-center gap-3 w-full">
                          <ClipboardList size={16} className="text-[#475569]" />
                          <span className="text-sm font-semibold text-[#0F172A]">My Appointments</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Doctor-only: My Vlogs */}
                    {userType === "DOCTOR" && (
                      <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-[#F8FAFC]">
                        <Link href="/doctor/vlogs" className="flex items-center gap-3 w-full">
                          <Video size={16} className="text-[#475569]" />
                          <span className="text-sm font-semibold text-[#0F172A]">My Vlogs</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* My Orders (patient / all) */}
                    {(!userType || userType === "PATIENT") && (
                      <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-[#F8FAFC]">
                        <Link href="/orders" className="flex items-center gap-3 w-full">
                          <Package size={16} className="text-[#475569]" />
                          <span className="text-sm font-semibold text-[#0F172A]">My Orders</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Settings */}
                    <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-[#F8FAFC]">
                      <Link href={userType === "DOCTOR" ? "/doctor/settings" : "/settings"} className="flex items-center gap-3 w-full">
                        <Settings size={16} className="text-[#475569]" />
                        <span className="text-sm font-semibold text-[#0F172A]">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* Support */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-[#F8FAFC]">
                      <Link href="/support" className="flex items-center gap-3 w-full">
                        <MessageSquare size={16} className="text-[#475569]" />
                        <span className="text-sm font-semibold text-[#0F172A]">Help & Support</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="py-2.5 px-3 rounded-xl cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 flex items-center gap-3"
                      onClick={() => signOut()}>
                      <LogOut size={16} />
                      <span className="text-sm font-semibold">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" className="font-bold text-[#475569] px-4 h-10 hover:text-[#00A87E] transition-colors">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="font-bold bg-[#00A87E] hover:bg-[#007A5C] px-5 h-10 shadow-sm transition-all active:scale-95 rounded-lg">
                      Sign Up
                    </Button>
                  </Link>
                </div>
                {/* Mobile: just user icon */}
                <Link href="/login" className="sm:hidden" aria-label="Login">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <User className="h-5 w-5 text-[#475569]" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Sticky spacer */}
      {isSticky && <div className="h-[76px]" />}
    </header>
  );
}
