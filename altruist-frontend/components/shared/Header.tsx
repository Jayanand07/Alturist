"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MapPin, Search, ShoppingCart, User, Menu, ChevronDown, LogOut, 
  Settings, ClipboardList, Package, LayoutDashboard, HeartPulse, X, Globe
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

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isSticky, setIsSticky] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { title: "Consult Doctors", href: "/consult" },
    { title: "Diagnostic Tests", href: "/labs" },
    { title: "Medicines", href: "/medicines" },
    { title: "Health Plans", href: "/plans" },
    { title: "About Us", href: "/about" },
  ];

  const isActive = (href: string) => pathname === href;

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
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="md:hidden">
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
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.title} href={link.href}
                    className={cn("px-4 py-3 rounded-xl text-lg font-semibold transition-colors",
                      isActive(link.href) ? "bg-[#E6F7F3] text-[#00A87E]" : "text-[#475569] hover:bg-[#F8FAFC]"
                    )}>
                    {link.title}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <HeartPulse className="w-8 h-8 text-[#00A87E]" />
            <span className="font-heading text-xl font-extrabold text-[#0F172A] tracking-tight hidden sm:block">ALTRUIST</span>
          </Link>
        </div>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link key={link.title} href={link.href}
              className={cn(
                "relative py-1 text-[15px] font-semibold text-[#475569] transition-colors hover:text-[#00A87E]",
                isActive(link.href) && "text-[#00A87E] after:absolute after:bottom-[-26px] after:left-0 after:w-full after:h-[3px] after:bg-[#00A87E] after:rounded-t-full"
              )}>
              {link.title}
            </Link>
          ))}
        </div>

        {/* Right: Search, Cart, Auth */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Bar */}
          <div className={cn("relative transition-all duration-300", isSearchOpen ? "w-[250px] md:w-[300px]" : "w-10 lg:w-[240px]")}>
            <Input 
              placeholder="Search health products..." 
              className={cn("pl-11 h-11 border-[#E2E8F0] focus:border-[#00A87E] transition-all bg-[#F8FAFC] rounded-full", !isSearchOpen && "hidden lg:flex")}
            />
            <Button variant="ghost" size="icon" 
              className={cn("absolute left-1 top-1 rounded-full hover:bg-transparent", !isSearchOpen && "lg:left-1")}
              onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className={cn("w-5 h-5 text-[#475569]", isSearchOpen && "text-[#00A87E]")} />
            </Button>
            {isSearchOpen && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1 rounded-full md:hidden"
                onClick={() => setIsSearchOpen(false)}>
                <X className="w-4 h-4 text-[#475569]" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-[#E6F7F3] transition-colors h-11 w-11 rounded-full group">
                <ShoppingCart className="w-5 h-5 text-[#475569] group-hover:text-[#00A87E]" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-[#FF6B35] hover:bg-[#FF6B35] border-2 border-white">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center gap-2 pl-2">
                    <Avatar className="h-9 w-9 border-2 border-[#E2E8F0] hover:border-[#00A87E] transition-colors">
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback className="bg-[#E6F7F3] text-[#00A87E] font-bold">
                        {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown size={14} className="text-[#475569] hidden sm:block" />
                  </Button>
                } />
                <DropdownMenuContent align="end" className="w-64 p-2 mt-2 rounded-2xl border-[#E2E8F0]">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="mb-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#0F172A]">{user.displayName || "Altruist User"}</span>
                        <span className="text-xs font-medium text-[#475569] truncate">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer flex gap-3">
                      <LayoutDashboard size={18} className="text-[#475569]" />
                      <Link href="/patient">My Dashboard</Link>
                    </DropdownMenuItem>
                    { (!(user as any)?.role || (user as any)?.role === 'PATIENT' || (user as any)?.userType === 'PATIENT') && (
                      <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer flex gap-3">
                        <ClipboardList size={18} className="text-[#475569]" />
                        <Link href="/patient/appointments">My Appointments</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer flex gap-3">
                      <Package size={18} className="text-[#475569]" />
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer flex gap-3">
                      <Settings size={18} className="text-[#475569]" />
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      className="py-2.5 px-3 rounded-xl cursor-pointer flex gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => signOut()}>
                      <LogOut size={18} />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="font-bold text-[#475569] px-4 h-10 hover:text-[#00A87E] transition-colors">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button className="font-bold bg-[#00A87E] hover:bg-[#007A5C] px-5 h-10 shadow-sm transition-all active:scale-95 rounded-lg">Sign Up</Button>
                </Link>
              </div>
            )}
            
            {!user && (
              <Link href="/login" className="sm:hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <User className="h-5 w-5 text-[#475569]" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
      {isSticky && <div className="h-[76px]" />}
    </header>
  );
}
