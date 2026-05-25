"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin, Search, ShoppingCart, User, Menu, ChevronDown, LogOut,
  Settings, ClipboardList, Package, LayoutDashboard, HeartPulse, X,
  Globe, Video, Bell, Stethoscope, FlaskConical, Pill, CreditCard,
  Building2, MessageSquare, Calendar,
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
import { useLocationStore } from "@/store/locationStore";
import LocationSelectorModal from "@/components/shared/LocationSelectorModal";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";


// ── Services dropdown items ────────────────────────────────────────────────
const SERVICES = [
  { label: "Consult Doctors",  href: "/consult",     icon: Stethoscope, desc: "Instant chat consultation", tKey: "nav.consult"  },
  { label: "Order Medicines",  href: "/medicines",   icon: Pill,        desc: "Delivered to your door", tKey: "nav.medicines"       },
  { label: "Diagnostic Tests", href: "/labs",        icon: FlaskConical,desc: "Lab reports in 24h", tKey: "nav.labs"           },
  { label: "Health Plans",     href: "/plans",       icon: CreditCard,  desc: "Affordable subscriptions", tKey: "nav.plans"     },
];

// ── Top-level nav links (non-Services) ────────────────────────────────────
const NAV_LINKS = [
  { title: "Plans",    href: "/plans", tKey: "nav.plans" },
  { title: "About Us", href: "/about", tKey: "nav.about" },
];

const RESOURCES = [
  { label: "Doctor Vlogs", href: "/vlogs",   icon: Video,     desc: "Health tips from experts", tKey: "nav.vlogs" },
];

export default function Header() {
  const pathname          = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [isSticky,       setIsSticky]       = useState(false);
  const [isSearchOpen,   setIsSearchOpen]   = useState(false);
  const [servicesOpen,   setServicesOpen]   = useState(false);
  const [resourcesOpen,  setResourcesOpen]  = useState(false);
  const servicesRef                         = useRef<HTMLDivElement>(null);
  const resourcesRef                        = useRef<HTMLDivElement>(null);
  const { getTotalItems }                   = useCartStore();
  const cartCount                           = getTotalItems();
  const { selectedCity, selectedState }     = useLocationStore();
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch Notifications
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await api.get("/notifications");
        return res.data;
      } catch (err) {
        return [];
      }
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds automatically
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  // Mark single as read mutation
  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  // Mark all as read mutation
  const readAllMutation = useMutation({
    mutationFn: async () => {
      await api.post("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    }
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification dismissed");
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case "CHAT":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "SYSTEM":
        return <Globe className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };


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
      <div className="bg-accent text-accent-foreground py-2 px-4 md:px-8 flex justify-between items-center text-xs font-medium tracking-tight overflow-hidden whitespace-nowrap">
        <div 
          onClick={() => setIsLocationOpen(true)}
          className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-90"
        >
          <div className="flex items-center bg-black/10 rounded-full px-3 py-1 gap-1.5 backdrop-blur-sm border border-black/5">
            <MapPin size={12} className="text-accent-foreground/80" />
            <span className="truncate max-w-[120px] md:max-w-none">{selectedCity}, {selectedState}</span>
            <ChevronDown size={10} className="text-accent-foreground/60" />
          </div>
        </div>


        <div className="flex items-center gap-4 md:gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="flex items-center gap-2 cursor-pointer hover:text-accent-foreground/80 transition-colors bg-transparent border-none text-xs font-medium text-inherit focus:outline-none p-0">
                <Globe size={12} />
                <span className="opacity-80">{t("nav.language")}:</span>
                <span className="font-bold uppercase">{language}</span>
                <ChevronDown size={10} className="opacity-60" />
              </button>
            } />
            <DropdownMenuContent align="end" className="mt-1 border-border shadow-md rounded-xl bg-background p-1 min-w-[120px]">
              <DropdownMenuItem onClick={() => setLanguage("en")} className="cursor-pointer font-semibold text-xs flex justify-between items-center px-3 py-2 rounded-lg hover:bg-muted">
                <span>English</span>
                {language === "en" && <span className="text-[#0D9373] font-bold">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("hi")} className="cursor-pointer font-semibold text-xs flex justify-between items-center px-3 py-2 rounded-lg hover:bg-muted">
                <span>हिंदी (Hindi)</span>
                {language === "hi" && <span className="text-[#0D9373] font-bold">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("pa")} className="cursor-pointer font-semibold text-xs flex justify-between items-center px-3 py-2 rounded-lg hover:bg-muted">
                <span>ਪੰਜਾਬੀ (Punjabi)</span>
                {language === "pa" && <span className="text-[#0D9373] font-bold">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("bn")} className="cursor-pointer font-semibold text-xs flex justify-between items-center px-3 py-2 rounded-lg hover:bg-muted">
                <span>বাংলা (Bengali)</span>
                {language === "bn" && <span className="text-[#0D9373] font-bold">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("mr")} className="cursor-pointer font-semibold text-xs flex justify-between items-center px-3 py-2 rounded-lg hover:bg-muted">
                <span>मराठी (Marathi)</span>
                {language === "mr" && <span className="text-[#0D9373] font-bold">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={cn(
        "bg-background border-b border-border transition-all duration-300 z-50 px-4 md:px-8 py-3 flex items-center justify-between",
        isSticky ? "fixed top-0 left-0 w-full shadow-lg shadow-black/5 h-[110px]" : "relative h-[120px]"
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
                <SheetTitle>
                  <img src="/logo.png" alt="Altruist Wellness" className="h-20 w-auto object-contain" />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1">
                {/* Services section in mobile */}
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">{t("nav.services")}</p>
                {SERVICES.map(s => (
                  <Link key={s.href} href={s.href}
                    className={cn(
                       "px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3",
                       isActive(s.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                    )}>
                    <s.icon size={16} className={isActive(s.href) ? "text-primary" : "text-muted-foreground/60"} />
                    {t(s.tKey)}
                  </Link>
                ))}
                <div className="my-3 border-t border-border" />
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">{t("nav.resources")}</p>
                {RESOURCES.map(r => (
                  <Link key={r.href} href={r.href}
                    className={cn(
                       "px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3",
                       isActive(r.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                    )}>
                    <r.icon size={16} className={isActive(r.href) ? "text-primary" : "text-muted-foreground/60"} />
                    {t(r.tKey)}
                  </Link>
                ))}
                <div className="my-3 border-t border-border" />
                {NAV_LINKS.map(link => (
                  <Link key={link.href} href={link.href}
                    className={cn(
                       "px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                       isActive(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                    )}>
                    {t(link.tKey)}
                  </Link>
                ))}
                {/* Auth in mobile drawer */}
                {!user && (
                  <>
                    <div className="my-3 border-t border-border" />
                    <Link href="/login">
                      <Button variant="outline" className="w-full font-bold border-border text-muted-foreground mb-2 hover:text-foreground">Log In</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
 
          {/* Logo */}
          <Link href="/" className="flex items-center group transition-transform active:scale-95">
            <img src="/logo.png" alt="Altruist Wellness" className="h-24 w-auto object-contain" />
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
                "flex items-center gap-1 py-1 text-[15px] font-semibold transition-colors hover:text-primary",
                SERVICES.some(s => isActive(s.href))
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              {t("nav.services")}
              <ChevronDown size={15} className={cn("transition-transform duration-200", servicesOpen && "rotate-180")} />
            </button>

            {/* Services mega-dropdown */}
            {servicesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[340px] bg-background rounded-2xl border border-border shadow-xl shadow-black/8 p-2 z-50">
                {/* Triangle arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
                  <div className="w-3 h-3 bg-background border-l border-t border-border rotate-45 translate-y-1 translate-x-0.5" />
                </div>
                {SERVICES.map(s => (
                  <Link key={s.href} href={s.href}
                    onClick={() => setServicesOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                      isActive(s.href)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50 text-muted-foreground"
                    )}>
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                      isActive(s.href) ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
                    )}>
                      <s.icon size={17} className={isActive(s.href) ? "text-primary" : "text-muted-foreground/70 group-hover:text-primary"} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-foreground">{t(s.tKey)}</span>
                      <span className="text-xs text-muted-foreground">{s.desc}</span>
                    </div>
                    {isActive(s.href) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Regular nav links */}
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className={cn(
                "relative py-1 text-[15px] font-semibold transition-colors hover:text-primary",
                isActive(link.href)
                  ? "text-primary after:absolute after:bottom-[-26px] after:left-0 after:w-full after:h-[3px] after:bg-primary after:rounded-t-full"
                  : "text-muted-foreground"
              )}>
              {t(link.tKey)}
            </Link>
          ))}

          {/* Resources Dropdown */}
          <div ref={resourcesRef} className="relative">
            <button
              onClick={() => setResourcesOpen(o => !o)}
              className={cn(
                "flex items-center gap-1 py-1 text-[15px] font-semibold transition-colors hover:text-primary",
                RESOURCES.some(r => isActive(r.href)) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t("nav.resources")}
              <ChevronDown size={15} className={cn("transition-transform duration-200", resourcesOpen && "rotate-180")} />
            </button>

            {resourcesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[280px] bg-background rounded-2xl border border-border shadow-xl p-2 z-50">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
                  <div className="w-3 h-3 bg-background border-l border-t border-border rotate-45 translate-y-1 translate-x-0.5" />
                </div>
                {RESOURCES.map(r => (
                  <Link key={r.href} href={r.href} onClick={() => setResourcesOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                      isActive(r.href) ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground"
                    )}>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                      isActive(r.href) ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
                    )}>
                      <r.icon size={15} className={isActive(r.href) ? "text-primary" : "text-muted-foreground/70 group-hover:text-primary"} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground">{t(r.tKey)}</span>
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
              className={cn("pl-11 h-11 border-border focus:border-primary transition-all bg-muted/50 rounded-full", !isSearchOpen && "hidden lg:flex")}
            />
            <Button variant="ghost" size="icon"
              className={cn("absolute left-1 top-1 rounded-full hover:bg-transparent", !isSearchOpen && "lg:left-1")}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search">
              <Search className={cn("w-5 h-5 text-muted-foreground", isSearchOpen && "text-primary")} />
            </Button>
            {isSearchOpen && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1 rounded-full md:hidden hover:bg-transparent"
                onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Support icon — for logged-in users */}
            {user && (
              <Link href="/support">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors h-11 w-11 rounded-full group">
                  <MessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                </Button>
              </Link>
            )}

            {/* Notification Bell — with dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                    className="relative hover:bg-primary/10 transition-colors h-11 w-11 rounded-full group shrink-0"
                  >
                    <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background animate-pulse" />
                    )}
                  </Button>
                } />
                
                <DropdownMenuContent align="end" className="w-80 p-2 mt-2 rounded-2xl border-border shadow-xl bg-background max-h-[480px] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-primary" /> Notifications
                      {unreadCount > 0 && (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold text-[10px] py-0 px-2 rounded-full">
                          {unreadCount} new
                        </Badge>
                      )}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          readAllMutation.mutate();
                        }}
                        className="text-[10px] font-black uppercase text-primary tracking-wider hover:underline"
                        disabled={readAllMutation.isPending}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="py-1 space-y-1 mt-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                          <Bell className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-xs text-foreground mt-2">All caught up!</p>
                        <p className="text-[10px] text-muted-foreground max-w-xs">You have no active notifications at the moment.</p>
                      </div>
                    ) : (
                      notifications.map((n: any) => (
                        <div
                          key={n.id}
                          onClick={() => !n.isRead && readMutation.mutate(n.id)}
                          className={cn(
                            "p-3 rounded-xl transition-all cursor-pointer relative group/item flex gap-3 text-left border border-transparent",
                            n.isRead 
                              ? "hover:bg-muted/30" 
                              : "bg-primary/5 hover:bg-primary/10 border-primary/5 shadow-inner"
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 space-y-0.5 min-w-0 pr-4">
                            <div className="flex items-center justify-between">
                              <p className={cn("text-xs leading-none truncate", n.isRead ? "font-bold text-foreground/80" : "font-extrabold text-foreground")}>
                                {n.title}
                              </p>
                              <span className="text-[9px] text-muted-foreground/60 font-semibold shrink-0">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: false })}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium leading-normal line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(n.id);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100"
                            title="Dismiss notification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Cart Icon */}
            <Link href="/cart" aria-label={`Cart (${cartCount} items)`}>
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors h-11 w-11 rounded-full group">
                <ShoppingCart className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary hover:bg-primary border-2 border-background text-primary-foreground">
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
                    <Avatar className="h-9 w-9 border-2 border-border hover:border-primary transition-colors">
                      <AvatarImage src={(user as any).photoURL || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {(user.displayName?.charAt(0) || user.email?.charAt(0) || "A").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
                  </Button>
                } />
                <DropdownMenuContent align="end" className="w-64 p-2 mt-2 rounded-2xl border-border shadow-xl bg-background">
                  {/* User info header */}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="mb-1 px-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{user.displayName || "Altruist User"}</span>
                        <span className="text-xs font-medium text-muted-foreground truncate">{user.email}</span>
                        {userType && (
                          <span className={cn(
                            "mt-1 inline-flex items-center self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            userType === "DOCTOR" ? "bg-blue-50 text-blue-600" :
                            userType === "SUPER_ADMIN" ? "bg-purple-50 text-purple-600" :
                            "bg-primary/10 text-primary"
                          )}>
                            {userType}
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-border" />

                  {/* Navigation items */}
                  <DropdownMenuGroup>
                    {/* My Dashboard */}
                    <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-muted/50">
                      <Link href={userType === "DOCTOR" ? "/doctor" : (userType === "SUPER_ADMIN" || userType === "ADMIN") ? "/admin/dashboard" : "/patient"}
                        className="flex items-center gap-3 w-full">
                        <LayoutDashboard size={16} className="text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">My Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Dynamic Appointments / Consultations Route */}
                    <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-muted/50">
                      <Link 
                        href={
                          userType === "DOCTOR" 
                            ? "/doctor" 
                            : (userType === "SUPER_ADMIN" || userType === "ADMIN") 
                              ? "/admin/consultations" 
                              : "/patient/appointments"
                        }
                        className="flex items-center gap-3 w-full"
                      >
                        <ClipboardList size={16} className="text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
                          {
                            userType === "DOCTOR" 
                              ? "My Schedule" 
                              : (userType === "SUPER_ADMIN" || userType === "ADMIN") 
                                ? "Manage Consultations" 
                                : "My Appointments"
                          }
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Doctor-only: My Vlogs */}
                    {userType === "DOCTOR" && (
                      <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-muted/50">
                        <Link href="/doctor/vlogs" className="flex items-center gap-3 w-full">
                          <Video size={16} className="text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">My Vlogs</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Dynamic Orders / Manage Medicines Route */}
                    {userType !== "DOCTOR" && (
                      <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-muted/50">
                        <Link href={(userType === "SUPER_ADMIN" || userType === "ADMIN") ? "/admin/medicines" : "/orders"} className="flex items-center gap-3 w-full">
                          <Package size={16} className="text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            {(userType === "SUPER_ADMIN" || userType === "ADMIN") ? "Manage Medicines" : "My Orders"}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Settings */}
                    <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-muted/50">
                      <Link href={userType === "DOCTOR" ? "/doctor/settings" : (userType === "SUPER_ADMIN" || userType === "ADMIN") ? "/admin/settings" : "/settings"} className="flex items-center gap-3 w-full">
                        <Settings size={16} className="text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-border" />

                  {/* Support */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="py-2.5 px-3 rounded-xl cursor-pointer focus:bg-muted/50">
                      <Link href={userType === "DOCTOR" ? "/doctor/support" : (userType === "ADMIN" || userType === "SUPER_ADMIN") ? "/admin/support" : "/support"} className="flex items-center gap-3 w-full">
                        <MessageSquare size={16} className="text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Help & Support</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-border" />

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
                    <Button variant="ghost" className="font-bold text-muted-foreground px-4 h-10 hover:text-primary transition-colors">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-5 h-10 shadow-sm transition-all active:scale-95 rounded-lg">
                      Sign Up
                    </Button>
                  </Link>
                </div>
                {/* Mobile: just user icon */}
                <Link href="/login" className="sm:hidden" aria-label="Login">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Sticky spacer */}
      {isSticky && <div className="h-[120px]" />}
      {/* Location Selector Modal */}
      <LocationSelectorModal 
        isOpen={isLocationOpen} 
        onClose={() => setIsLocationOpen(false)} 
      />
    </header>
  );
}

