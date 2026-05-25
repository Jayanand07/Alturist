"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  UserRound, 
  Users, 
  Pill, 
  ClipboardList, 
  Settings, 
  LifeBuoy,
  CreditCard,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userType, loading, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Role Protection
  useEffect(() => {
    if (!loading && userType && userType !== "ADMIN" && userType !== "SUPER_ADMIN") {
      router.push("/login");
    }
  }, [userType, loading, router]);

  if (loading || !userType || (userType !== "ADMIN" && userType !== "SUPER_ADMIN")) {
    return null; // Handle in AuthContext loader
  }

  const navLinks = [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Doctors", href: "/admin/doctors", icon: UserRound },
    { title: "Patients", href: "/admin/patients", icon: Users },
    { title: "Medicines", href: "/admin/medicines", icon: Pill },
    { title: "Consultations", href: "/admin/consultations", icon: ClipboardList },
    { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { title: "Support", href: "/admin/support", icon: LifeBuoy },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-surface-muted/30 flex font-sans">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col",
          isSidebarOpen ? "w-[260px]" : "w-[80px]"
        )}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Altruist Wellness" className={cn("h-8 w-auto object-contain transition-all", !isSidebarOpen && "mx-auto")} />
            {isSidebarOpen && (
               <span className="text-[10px] font-black bg-teal-50 text-[#0D9488] border border-teal-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Admin</span>
            )}
          </Link>
        </div>

        {/* Back to Home Link */}
        <div className="px-4 py-2 border-b border-gray-100">
           <Link 
             href="/" 
             className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all group"
           >
             <Home size={18} className="group-hover:text-teal-600 transition-colors" />
             {isSidebarOpen && <span className="text-sm font-bold">Back to Website</span>}
           </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.title} 
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-teal-50 text-[#0D9488]" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <link.icon className={cn("w-5 h-5", isActive ? "text-[#0D9488]" : "group-hover:text-gray-900")} />
                {isSidebarOpen && <span className="font-semibold text-[15px]">{link.title}</span>}
                {isActive && isSidebarOpen && (
                   <div className="absolute right-2 text-[#0D9488]">
                      <ChevronRight size={16} />
                   </div>
                )}
                {!isSidebarOpen && (
                   <div className="absolute left-full ml-4 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60]">
                      {link.title}
                   </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section - Profile & Logout */}
        <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/50">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="bg-teal-100 text-[#0D9488] font-bold">A</AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
               <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-gray-900 truncate">Admin User</span>
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Super Admin</span>
               </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 h-11 px-3 rounded-xl font-bold transition-all",
              !isSidebarOpen && "justify-center px-0"
            )}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isSidebarOpen ? "ml-[260px]" : "ml-[80px]"
        )}
      >
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-500 hover:bg-gray-100 rounded-lg lg:flex hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu size={20} />
              </Button>
              <h2 className="text-xl font-bold text-gray-900 capitalize tracking-tight">
                {pathname.split("/").pop()}
              </h2>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-teal-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-teal-200">
                Admin Panel
              </div>
           </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
           {children}
        </main>
      </div>
    </div>
  );
}
