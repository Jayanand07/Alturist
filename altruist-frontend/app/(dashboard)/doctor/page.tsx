"use client";

import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Users, Calendar, DollarSign, Star, Video, Clock, 
  MessageSquare, Settings, PlaySquare, Plus, Activity, 
  CheckCircle2, PlusCircle, PenSquare, ArrowRight, VideoIcon
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// Format functions
const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(dateStr));
};

const canJoinCall = (dateStr: string) => {
  if (!dateStr) return false;
  const diffMinutes = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60);
  return diffMinutes <= 15 && diffMinutes >= -60; // Can join 15 mins early up to 1 hr late
};

const formatPatientName = (name: string) => {
  if (!name) return "Patient";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  }
  return parts[0];
};

export default function DoctorDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, userType, loading: authLoading } = useAuth();
  
  // Auth Guard
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
    } else if (!authLoading && userType && userType !== "DOCTOR") {
      router.push("/");
    }
  }, [authUser, userType, authLoading, router]);

  // Queries
  const { data: dash, isLoading: dashLoading } = useQuery({
    queryKey: ["doctor-dashboard"],
    queryFn: async () => (await api.get("/doctors/dashboard")).data,
    enabled: !!authUser && userType === "DOCTOR",
    refetchInterval: 30000,
  });

  const { data: vlogs, isLoading: vlogsLoading } = useQuery({
    queryKey: ["doctor-vlogs"],
    queryFn: async () => {
      try {
        return (await api.get("/doctors/my/vlogs")).data;
      } catch(e) { return []; }
    },
    enabled: !!authUser && userType === "DOCTOR",
  });

  // Toggle Availability Mutation
  const toggleMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      await api.patch("/doctors/availability", { isAvailable });
    },
    onSuccess: (_, variables) => {
      toast.success(variables ? "You are now available for instant consults" : "You are now unavailable");
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard"] });
      // Optimistic update
      if (dash) queryClient.setQueryData(["doctor-dashboard"], { ...dash, isAvailable: variables });
    },
    onError: () => {
      toast.error("Failed to update availability");
    }
  });

  if (authLoading || dashLoading) return <DashboardSkeleton />;
  if (!authUser || userType !== "DOCTOR" || !dash) return null;

  const doctorLastName = authUser.displayName?.split(" ").pop() || "Doctor";
  const doctorSpecialty = dash.specialization || "General Physician";
  const isAvailable = dash.isAvailable !== undefined ? dash.isAvailable : true;

  const chartData = Array.isArray(dash.monthlyEarnings) 
    ? dash.monthlyEarnings.map((val: any, idx: number) => 
        typeof val === 'number' 
          ? { month: `M${idx+1}`, amount: val } 
          : { month: val.month || `M${idx+1}`, amount: val.amount || 0 }
      )
    : [];

  // Group consultations
  const allConsults = dash.upcomingConsultations || [];
  const instantQueue = allConsults.filter((c: any) => c.type === "INSTANT" && c.status === "PENDING");
  const scheduledToday = allConsults.filter((c: any) => c.type !== "INSTANT" || (c.type === "INSTANT" && c.status !== "PENDING"));

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 min-h-screen bg-surface-muted/30 text-foreground">
      
      {/* Top Header Workspace */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
           <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-sm">
             <AvatarImage src={authUser.photoURL || dash.profilePictureUrl} />
             <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">{doctorLastName.charAt(0)}</AvatarFallback>
           </Avatar>
           <div>
             <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
               Dr. {doctorLastName}
             </h1>
             <p className="text-muted-foreground font-medium flex items-center gap-2">
               {doctorSpecialty} <span className="w-1 h-1 rounded-full bg-border" /> Workspace Overview
             </p>
           </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-surface p-2 rounded-xl shadow-sm border border-border">
          <div className="px-4">
             <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Instant Consults</p>
             <div className="flex items-center gap-2">
               <span className="relative flex h-2.5 w-2.5">
                 {isAvailable && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                 <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isAvailable ? "bg-green-500" : "bg-slate-300")}></span>
               </span>
               <span className={cn("text-sm font-bold", isAvailable ? "text-green-700" : "text-slate-500")}>
                 {isAvailable ? "Accepting Patients" : "Offline"}
               </span>
             </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="pr-2">
            <Switch 
              checked={isAvailable} 
              disabled={toggleMutation.isPending}
              onCheckedChange={(val) => toggleMutation.mutate(val)} 
              className="data-[state=checked]:bg-primary" 
            />
          </div>
        </div>
      </div>

      {/* Stats Density Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { label: "Today's Consults", value: dash.todayConsultations || 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Pending Instant", value: instantQueue.length, icon: Activity, color: "text-orange-600", bg: "bg-orange-100" },
          { label: "Total Patients", value: dash.totalPatients || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Average Rating", value: dash.rating?.toFixed(1) || "5.0", icon: Star, color: "text-amber-500", bg: "bg-amber-100" },
          { label: "Month Earnings", value: `₹${(dash.totalEarnings || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-center shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                <stat.icon size={16} strokeWidth={3} />
              </div>
            </div>
            <h3 className="font-heading text-2xl font-black text-foreground leading-none">{stat.value}</h3>
            <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Workspace Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Instant Queue Warning if Available */}
          {isAvailable && instantQueue.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between shadow-sm shadow-orange-500/5">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 animate-pulse">
                   <VideoIcon size={20} />
                 </div>
                 <div>
                   <h4 className="font-bold text-orange-900">Instant Consultations Waiting</h4>
                   <p className="text-xs font-medium text-orange-700 mt-0.5">{instantQueue.length} patient(s) are in your queue right now.</p>
                 </div>
               </div>
               <Button onClick={() => router.push(`/consultation/${instantQueue[0].id}`)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 shadow-md">
                 Accept Next
               </Button>
            </div>
          )}

          {/* Today's Schedule Data Table */}
          <Card className="border border-border shadow-sm bg-surface rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border py-4 px-5 bg-surface/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar size={18} className="text-primary"/> Today's Schedule
                </CardTitle>
              </div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none">{scheduledToday.length} Appointments</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {scheduledToday.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-muted text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-5 py-3">Time</th>
                        <th className="px-5 py-3">Patient</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {scheduledToday.map((consult: any) => {
                        const isJoinable = canJoinCall(consult.scheduledAt);
                        return (
                          <tr key={consult.id} className="hover:bg-surface-muted/30 transition-colors font-medium">
                            <td className="px-5 py-4 font-bold text-foreground">
                              {formatTime(consult.scheduledAt)}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {formatPatientName(consult.patient?.fullName || consult.patientName).charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-foreground">
                                  {formatPatientName(consult.patient?.fullName || consult.patientName)}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <Badge variant="outline" className="text-[10px] font-bold border-border bg-surface text-muted-foreground">
                                {consult.type || "VIDEO"}
                              </Badge>
                            </td>
                            <td className="px-5 py-4">
                              <Badge className={cn(
                                "font-bold text-[10px] border-none uppercase tracking-wider",
                                consult.status === "PENDING" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                              )}>
                                {consult.status}
                              </Badge>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {isJoinable ? (
                                <Button size="sm" onClick={() => router.push(`/consultation/${consult.id}`)} className="bg-primary hover:bg-primary/90 text-white font-bold h-8">
                                  Join Call
                                </Button>
                              ) : (
                                <span className="text-xs font-bold text-muted-foreground">Waiting</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={<CheckCircle2 size={32} className="text-muted-foreground/50" />} title="All Clear" message="No scheduled appointments for today." />
              )}
            </CardContent>
          </Card>

          {/* Earnings Dense Graph */}
          {chartData.length > 0 && (
            <Card className="border border-border shadow-sm bg-surface rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border py-4 px-5 bg-surface/50">
                <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  <Activity size={18} className="text-primary"/> Earnings Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => `₹${val}`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                        cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Tools */}
          <Card className="border border-border shadow-sm bg-surface rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border py-4 px-5 bg-surface/50">
              <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <Settings size={18} className="text-primary"/> Workspace Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "New Vlog", icon: PlusCircle, href: "/doctor/vlogs/new", color: "text-purple-600", bg: "bg-purple-100" },
                  { label: "Patients", icon: Users, href: "/doctor/patients", color: "text-blue-600", bg: "bg-blue-100" },
                  { label: "History", icon: Clock, href: "/doctor/consultations", color: "text-amber-600", bg: "bg-amber-100" },
                  { label: "Settings", icon: Settings, href: "/settings", color: "text-slate-600", bg: "bg-slate-100" },
                ].map((action, i) => (
                  <Link key={i} href={action.href}>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-surface-muted/50 transition-colors cursor-pointer group">
                      <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", action.bg, action.color)}>
                        <action.icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-foreground">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vlogs Manager */}
          <Card className="border border-border shadow-sm bg-surface rounded-2xl overflow-hidden flex flex-col min-h-[300px]">
            <CardHeader className="border-b border-border py-4 px-5 bg-surface/50 flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <PlaySquare size={18} className="text-primary"/> Content Studio
              </CardTitle>
              <Link href="/doctor/vlogs/new">
                <Button size="icon" variant="ghost" className="h-6 w-6 text-primary hover:bg-primary/10">
                  <Plus size={16}/>
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              {vlogsLoading ? (
                <div className="flex-1 flex justify-center items-center"><Activity className="animate-spin text-muted-foreground/50" /></div>
              ) : vlogs && vlogs.length > 0 ? (
                <div className="divide-y divide-border">
                  {vlogs.slice(0,4).map((vlog: any) => (
                    <div key={vlog.id} className="p-4 flex items-start gap-3 hover:bg-surface-muted/50 transition-colors group">
                      <div className="w-14 h-14 bg-slate-900 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                        {vlog.thumbnailUrl ? (
                          <img src={vlog.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <PlaySquare className="text-white/50" size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-sm truncate">{vlog.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", vlog.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                            {vlog.isPublished ? "Published" : "Draft"}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground">{vlog.viewsCount || 0} views</span>
                        </div>
                      </div>
                      <Link href={`/doctor/vlogs/${vlog.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10">
                          <PenSquare size={14} />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 bg-surface-muted rounded-full flex items-center justify-center mb-3 text-muted-foreground/50">
                    <Video size={20} />
                  </div>
                  <p className="font-bold text-muted-foreground text-xs">No vlogs published yet</p>
                </div>
              )}
              <div className="p-3 border-t border-border bg-surface-muted/30 text-center mt-auto">
                <Link href="/doctor/vlogs" className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center justify-center gap-1">
                  View Library <ArrowRight size={12}/>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ icon, title, message }: any) {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center">
      <div className="mb-3 text-muted-foreground/30">
        {icon}
      </div>
      <h3 className="font-bold text-foreground text-sm">{title}</h3>
      <p className="text-muted-foreground font-medium text-xs mt-1">{message}</p>
    </div>
  );
}

// Skeleton Loader
function DashboardSkeleton() {
  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 min-h-screen bg-surface-muted/30">
      <div className="flex justify-between items-end pb-4 border-b border-border">
        <div className="h-12 bg-surface-muted animate-pulse rounded-xl w-64" />
        <div className="h-12 bg-surface-muted animate-pulse rounded-xl w-48" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-surface shadow-sm border border-border animate-pulse rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-80 bg-surface shadow-sm border border-border animate-pulse rounded-2xl" />
          <div className="h-64 bg-surface shadow-sm border border-border animate-pulse rounded-2xl" />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-40 bg-surface shadow-sm border border-border animate-pulse rounded-2xl" />
          <div className="h-80 bg-surface shadow-sm border border-border animate-pulse rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
