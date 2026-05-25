"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  LifeBuoy,
  Settings,
  Users,
  Video,
  Clock,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Sidebar() {
  const pathname = usePathname();
  const { userType, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) return <div className="w-[240px] border-r bg-white hidden md:block" />;

  const isDoctor = userType === "DOCTOR";
  const isPatient = userType === "PATIENT" || !userType;

  const patientLinks = [
    { title: "Dashboard", href: "/patient", icon: LayoutDashboard },
    { title: "Appointments", href: "/patient/appointments", icon: Calendar },
    { title: "Medicines", href: "/orders", icon: FileText },
    { title: "Plans", href: "/plans", icon: CreditCard },
    { title: "Support", href: "/support", icon: LifeBuoy },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const doctorLinks = [
    { title: "Dashboard", href: "/doctor", icon: LayoutDashboard },
    { title: "Consultations", href: "/doctor/consultations", icon: Video },
    { title: "Schedule", href: "/doctor/schedule", icon: Clock },
    { title: "Patients", href: "/doctor/patients", icon: Users },
    { title: "Vlogs", href: "/doctor/vlogs", icon: Video },
    { title: "Settings", href: "/doctor/settings", icon: Settings },
  ];

  const navLinks = isDoctor ? doctorLinks : patientLinks;

  const renderNavLinks = (mobile = false) => (
    <div className="flex flex-col h-full py-4 space-y-1">
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/patient" && link.href !== "/doctor" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.title}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 mx-3 rounded-lg transition-all duration-200 group relative",
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium",
              collapsed && !mobile && "justify-center mx-2 px-0"
            )}
            title={collapsed && !mobile ? link.title : undefined}
          >
            <link.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            {(!collapsed || mobile) && <span className="text-[14px]">{link.title}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger render={
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground">
              <Menu size={24} />
            </Button>
          } />
          <SheetContent side="left" className="w-[280px] p-0 pt-12">
            {renderNavLinks(true)}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop/Tablet Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-background border-r border-border transition-all duration-300 z-40 relative",
          collapsed ? "w-[80px]" : "w-[240px]"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-background shadow-sm hover:bg-muted z-50"
        >
          <ChevronRight size={14} className={cn("transition-transform duration-200", !collapsed && "rotate-180")} />
        </Button>
        <div className="flex-1 overflow-y-auto py-2">
          {renderNavLinks(false)}
        </div>
      </aside>
    </>
  );
}
