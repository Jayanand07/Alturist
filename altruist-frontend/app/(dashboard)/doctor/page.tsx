"use client";

import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Users, Calendar, DollarSign, Star, Video, Clock, 
  MessageSquare, Settings, PlaySquare, Plus, Activity, 
  CheckCircle2, PlusCircle, PenSquare
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
    } else if (!authLoading && userType !== "DOCTOR") {
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
      toast.success(variables ? "You are now available" : "You are now unavailable");
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
  const isAvailable = dash.isAvailable !== undefined ? dash.isAvailable : true; // Fallback

  // Format chart data safely
  const chartData = Array.isArray(dash.monthlyEarnings) 
    ? dash.monthlyEarnings.map((val: any, idx: number) => 
        typeof val === 'number' 
          ? { month: `Month ${idx+1}`, amount: val } 
          : { month: val.month || `M${idx+1}`, amount: val.amount || 0 }
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 min-h-screen bg-slate-50/50">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-[#00A87E]">Dr. {doctorLastName}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium mt-1">Here's your practice overview for today.</p>
        </div>

        <div className={cn(
          "flex items-center gap-6 px-6 py-4 rounded-2xl border transition-colors",
          isAvailable ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-200"
        )}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-3 h-3 rounded-full animate-pulse", isAvailable ? "bg-emerald-500" : "bg-slate-400")} />
              <p className={cn("font-bold text-sm uppercase tracking-wider", isAvailable ? "text-emerald-700" : "text-slate-500")}>
                {isAvailable ? "Available" : "Unavailable"}
              </p>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {isAvailable ? "Patients can book instant video consults." : "You are hidden from the available doctors list."}
            </p>
          </div>
          <Switch 
            checked={isAvailable} 
            disabled={toggleMutation.isPending}
            onCheckedChange={(val) => toggleMutation.mutate(val)} 
            className="data-[state=checked]:bg-[#00A87E] shrink-0" 
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Consults", value: dash.todayConsultations || 0, icon: Calendar, color: "text-[#2563EB]", bg: "bg-[#2563EB]/10" },
          { label: "Total Patients", value: dash.totalPatients || 0, icon: Users, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
          { label: "Average Rating", value: dash.rating?.toFixed(1) || "5.0", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Monthly Earnings", value: `₹${(dash.totalEarnings || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#00A87E]", bg: "bg-[#00A87E]/10" },
        ].map((stat, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("p-3.5 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black text-slate-900">{stat.value}</h3>
                <p className="text-sm font-bold text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Today's Schedule & Recent */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Schedule */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-6">
              <CardTitle className="font-heading text-xl font-bold text-slate-900">Today's Schedule</CardTitle>
              <CardDescription className="font-medium text-slate-500">Upcoming appointments for {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {dash.upcomingConsultations && dash.upcomingConsultations.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {dash.upcomingConsultations.map((consult: any) => {
                    const patientName = formatPatientName(consult.patient?.fullName || consult.patientName);
                    const isJoinable = canJoinCall(consult.scheduledAt);

                    return (
                      <div key={consult.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 border-2 border-teal-100">
                            <AvatarFallback className="bg-teal-50 text-[#00A87E] font-bold">
                              {patientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-heading font-extrabold text-slate-900 text-lg">{patientName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs font-bold border-slate-200 text-slate-600 bg-white">
                                {consult.type || "VIDEO"}
                              </Badge>
                              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                <Clock size={12} /> {formatTime(consult.scheduledAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <Badge className={cn(
                            "font-bold border-none capitalize",
                            consult.status === "PENDING" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                          )}>
                            {consult.status?.toLowerCase() || "Scheduled"}
                          </Badge>
                          
                          {isJoinable ? (
                            <Button onClick={() => router.push(`/consultation/${consult.id}`)} className="bg-[#00A87E] hover:bg-[#00906B] font-bold w-full md:w-auto shadow-md active:scale-95 transition-all">
                              <Video size={16} className="mr-2" /> Join Call
                            </Button>
                          ) : (
                            <Button disabled variant="outline" className="w-full md:w-auto font-bold bg-slate-50 border-slate-200 text-slate-400">
                              Wait
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState icon={<Calendar size={40} className="text-slate-300" />} title="No appointments today" message="You have a clear schedule. Relax or create some vlogs!" />
              )}
            </CardContent>
          </Card>

          {/* Earnings Chart */}
          {chartData.length > 0 && (
            <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 py-6">
                <CardTitle className="font-heading text-xl font-bold text-slate-900">Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} tickFormatter={(val) => `₹${val}`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#00A87E" strokeWidth={4} dot={{ r: 4, fill: '#00A87E', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column: Vlogs & Quick Actions */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-5 bg-slate-50/50">
              <CardTitle className="font-heading text-lg font-bold text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-2 gap-3">
              {[
                { label: "New Vlog", icon: PlusCircle, href: "/doctor/vlogs/new", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
                { label: "All Patients", icon: Users, href: "/doctor/patients", color: "text-[#2563EB]", bg: "bg-[#2563EB]/10" },
                { label: "History", icon: Clock, href: "/doctor/consultations", color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Settings", icon: Settings, href: "/settings", color: "text-slate-600", bg: "bg-slate-100" },
              ].map((action, i) => (
                <Link key={i} href={action.href}>
                  <div className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer text-center gap-2">
                    <div className={cn("p-2.5 rounded-full", action.bg, action.color)}>
                      <action.icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{action.label}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* My Vlogs */}
          <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-5 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg font-bold text-slate-900">My Vlogs</CardTitle>
              <Link href="/doctor/vlogs/new">
                <Button size="sm" className="bg-[#00A87E] hover:bg-[#00906B] font-bold h-8 px-3 shadow-md"><Plus size={14} className="mr-1"/> Add</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {vlogsLoading ? (
                <div className="p-8 flex justify-center"><Activity className="animate-spin text-slate-300" /></div>
              ) : vlogs && vlogs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {vlogs.slice(0,3).map((vlog: any) => (
                    <div key={vlog.id} className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                      <div className="w-16 h-16 bg-slate-900 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center group">
                        {vlog.thumbnailUrl ? (
                          <img src={vlog.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <PlaySquare className="text-slate-500" size={24} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{vlog.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", vlog.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                            {vlog.isPublished ? "Published" : "Draft"}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{vlog.viewsCount || 0} views</span>
                        </div>
                      </div>
                      <Link href={`/doctor/vlogs/${vlog.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#00A87E] hover:bg-teal-50">
                          <PenSquare size={16} />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Video size={24} />
                  </div>
                  <p className="font-bold text-slate-500 text-sm">No vlogs published yet 🎬</p>
                </div>
              )}
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <Link href="/doctor/vlogs" className="text-sm font-bold text-[#00A87E] hover:underline">View All Vlogs &rarr;</Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

// Emptry State Component
function EmptyState({ icon, title, message }: any) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
      <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
        {icon}
      </div>
      <h3 className="font-heading font-bold text-slate-900 text-xl">{title}</h3>
      <p className="text-slate-500 font-medium max-w-sm mx-auto">{message}</p>
    </div>
  );
}

// Skeleton Loader
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 min-h-screen bg-slate-50/50">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 p-8 bg-white rounded-3xl border border-slate-100">
        <div className="h-10 bg-slate-200 animate-pulse rounded-xl w-64" />
        <div className="h-14 bg-slate-200 animate-pulse rounded-2xl w-48" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white shadow-sm border border-slate-100 animate-pulse rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-96 bg-white shadow-sm border border-slate-100 animate-pulse rounded-3xl" />
          <div className="h-80 bg-white shadow-sm border border-slate-100 animate-pulse rounded-3xl" />
        </div>
        <div className="space-y-8">
          <div className="h-64 bg-white shadow-sm border border-slate-100 animate-pulse rounded-3xl" />
          <div className="h-80 bg-white shadow-sm border border-slate-100 animate-pulse rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
