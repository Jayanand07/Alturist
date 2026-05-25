"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  UserRound, 
  Calendar, 
  CreditCard,
  ShieldCheck,
  Clock,
  Activity,
  ArrowRight,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

interface Stats {
  totalDoctors: number;
  totalPatients: number;
  todayConsultations: number;
  monthlyRevenue: number;
}

interface RecentConsultation {
  id: string;
  patientName: string;
  doctorName: string;
  scheduledAt: string;
  status: string;
  amount: number;
}

interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  userType: string;
  createdAt: string;
}

interface DashboardData {
  stats: Stats;
  recentConsultations: RecentConsultation[];
  recentUsers: RecentUser[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard");
      return response.data as DashboardData;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const statsConfig = [
    { label: "Doctors", value: data?.stats.totalDoctors, icon: UserRound, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Patients", value: data?.stats.totalPatients, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Today's Consults", value: data?.stats.todayConsultations, icon: Calendar, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Month Revenue", value: data?.stats.monthlyRevenue, icon: CreditCard, color: "text-green-600", bg: "bg-green-100", isPrice: true },
  ];

  if (loading) {
     return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 min-h-screen bg-surface-muted/30 text-foreground animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* Dense Operational Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight">System Control Center</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider text-[10px] rounded-sm py-0.5">
              <ShieldCheck size={12} className="mr-1" /> Super Admin
            </Badge>
          </div>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Welcome back, {user?.displayName || "Admin"}.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-surface px-4 py-2 rounded-lg border border-border shadow-sm shrink-0">
           <div className="flex items-center gap-2 text-sm font-bold text-foreground">
             <Clock size={16} className="text-muted-foreground" />
             {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
           </div>
           <div className="w-px h-4 bg-border" />
           <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
             {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
           </div>
           <div className="w-px h-4 bg-border" />
           <div className="flex items-center gap-1.5">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">Systems Operational</span>
           </div>
        </div>
      </div>

      {/* Ultra-Dense KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className={cn("p-2 rounded-md", stat.bg, stat.color)}>
                <stat.icon size={16} strokeWidth={2.5} />
              </div>
              <Activity size={14} className="text-muted-foreground/40" />
            </div>
            <h3 className="font-heading text-2xl font-black text-foreground leading-none">
              {stat.isPrice 
                ? `₹${stat.value ? Number(stat.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}` 
                : (stat.value ?? 0).toLocaleString()}
            </h3>
            <p className="text-xs font-bold text-muted-foreground mt-1.5 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Recent Consultations Table */}
        <div className="xl:col-span-2">
          <Card className="border border-border shadow-sm bg-surface rounded-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="p-4 border-b border-border bg-surface-muted/30 flex flex-row items-center justify-between space-y-0">
               <div className="flex items-center gap-2">
                  <Activity size={16} className="text-primary" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Live Consultations Stream</CardTitle>
               </div>
               <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/20 text-[10px]">
                 {data?.recentConsultations?.length || 0} Records
               </Badge>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
               <Table>
                  <TableHeader className="bg-surface-muted/50 sticky top-0 z-10">
                     <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider h-10 px-4">Patient</TableHead>
                        <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider h-10 px-4">Provider</TableHead>
                        <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider h-10 px-4">Date & Time</TableHead>
                        <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider h-10 px-4">Status</TableHead>
                        <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider h-10 px-4 text-right">Revenue</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                     {data?.recentConsultations?.length ? data.recentConsultations.map((c) => (
                       <TableRow key={c.id} className="border-border hover:bg-surface-muted/30 transition-colors h-12">
                          <TableCell className="px-4 font-bold text-foreground">
                            {c.patientName || 'Unknown Patient'}
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                              <Stethoscope size={12} className="text-primary" />
                              Dr. {c.doctorName || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 text-muted-foreground font-medium">
                            {new Date(c.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="px-4">
                             <Badge className={cn("text-[9px] font-bold uppercase tracking-widest px-1.5 py-0 border-none", 
                                c.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                                c.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                                c.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')}>
                                {c.status}
                             </Badge>
                          </TableCell>
                          <TableCell className="px-4 text-right font-black text-foreground">
                            ₹{c.amount}
                          </TableCell>
                       </TableRow>
                     )) : (
                       <TableRow>
                         <TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-medium">No recent consultations found.</TableCell>
                       </TableRow>
                     )}
                  </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>

        {/* Identity & Access Log (Registrations) */}
        <div className="xl:col-span-1">
          <Card className="border border-border shadow-sm bg-surface rounded-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="p-4 border-b border-border bg-surface-muted/30 flex flex-row items-center justify-between space-y-0">
               <div className="flex items-center gap-2">
                  <UserRound size={16} className="text-primary" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">New Registrations</CardTitle>
               </div>
               <button className="text-muted-foreground hover:text-foreground transition-colors">
                 <ArrowRight size={14} />
               </button>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
               <div className="divide-y divide-border">
                  {data?.recentUsers?.length ? data.recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-surface-muted/30 transition-colors">
                       <Avatar className="h-9 w-9 border border-border shadow-sm">
                          <AvatarFallback className={cn("font-bold text-xs", u.userType === "DOCTOR" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700")}>
                            {String(u?.fullName || u?.email || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                       </Avatar>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="text-xs font-bold text-foreground truncate pr-2">{u?.fullName || "Unnamed User"}</h4>
                            <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest px-1 py-0 border-none", u.userType === "DOCTOR" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600")}>
                              {u.userType}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <p className="text-muted-foreground truncate pr-2">{u?.email || "No Email"}</p>
                            <p className="text-muted-foreground font-medium shrink-0">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          </div>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground text-xs font-medium">No recent registrations.</div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function DashboardSkeleton() {
   return (
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 min-h-screen bg-surface-muted/30 animate-pulse">
         <div className="flex justify-between items-end pb-4 border-b border-border">
            <div className="h-12 w-64 bg-surface rounded-lg" />
            <div className="h-10 w-48 bg-surface rounded-lg" />
         </div>
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
               <Skeleton key={i} className="h-24 w-full rounded-xl bg-surface" />
            ))}
         </div>
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Skeleton className="xl:col-span-2 h-[400px] rounded-xl bg-surface" />
            <Skeleton className="xl:col-span-1 h-[400px] rounded-xl bg-surface" />
         </div>
      </div>
   );
}
