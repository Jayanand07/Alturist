"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Star, 
  Video, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Bell,
  Play,
  Volume2,
  XIcon
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

interface Stats {
  todaysConsultations: number;
  monthlyEarnings: number;
  averageRating: number;
  totalPatientsTreated: number;
}

interface ConsultationItem {
  id: string;
  patientName: string;
  patientAge: number | null;
  patientGender: string | null;
  scheduledAt: string;
  status: string;
  type: string;
  chiefComplaint: string | null;
  waitingTimeMinutes: number | null;
  durationMinutes: number | null;
  prescriptionAdded: boolean;
}

interface DashboardData {
  doctorName: string;
  isAvailable: boolean;
  stats: Stats;
  todaysSchedule: ConsultationItem[];
  pendingInstantConsultations: ConsultationItem[];
  recentConsultations: ConsultationItem[];
}

export default function DoctorDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch Full Dashboard Data
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["doctor-dashboard"],
    queryFn: async () => {
      const response = await api.get("/doctors/dashboard");
      return response.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Accept Instant Mutation
  const acceptMutation = useMutation({
    mutationFn: async (consultationId: string) => {
      const response = await api.post(`/doctors/accept-instant/${consultationId}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Consultation accepted!");
      router.push(`/consultation/${data.consultationId}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to accept consultation");
    }
  });


  // Handle Availability Toggle
  const toggleAvailability = async (checked: boolean) => {
    setAvailabilityLoading(true);
    try {
      await api.put("/doctors/availability", { isAvailable: checked });
      await queryClient.invalidateQueries({ queryKey: ["doctor-dashboard"] });
      toast.success(`Availability updated successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update availability");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // ── NEW QUERIES AND STATES ──

  const { data: earningsData } = useQuery({
    queryKey: ["doctor-earnings"],
    queryFn: async () => {
      const response = await api.get("/doctors/earnings");
      return response.data;
    },
  });

  const { data: scheduleData, refetch: refetchSchedule } = useQuery({
    queryKey: ["doctor-schedule"],
    queryFn: async () => {
      const response = await api.get("/doctors/schedule");
      return response.data?.schedule ? JSON.parse(response.data.schedule) : null;
    },
  });

  const { data: rescheduleRequests, refetch: refetchReschedules } = useQuery({
    queryKey: ["doctor-reschedules"],
    queryFn: async () => {
      const response = await api.get("/doctors/reschedule-requests");
      return response.data;
    },
    refetchInterval: 30000,
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<any>({
    monday: { start: "09:00", end: "18:00", available: true },
    tuesday: { start: "09:00", end: "18:00", available: true },
    wednesday: { start: "09:00", end: "18:00", available: true },
    thursday: { start: "09:00", end: "18:00", available: true },
    friday: { start: "09:00", end: "18:00", available: true },
    saturday: { start: "09:00", end: "14:00", available: false },
    sunday: { start: "09:00", end: "14:00", available: false }
  });

  useEffect(() => {
    if (scheduleData && Object.keys(scheduleData).length > 0) {
      setWeeklySchedule({ ...weeklySchedule, ...scheduleData });
    }
  }, [scheduleData]);

  const saveWeeklyHours = async () => {
    try {
      await api.post("/doctors/schedule/set-hours", weeklySchedule);
      toast.success("Weekly hours saved!");
      setShowScheduleModal(false);
      refetchSchedule();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save hours");
    }
  };

  const approveReschedule = async (id: string) => {
    try {
      await api.put(`/consultations/${id}/approve-reschedule`);
      toast.success("Reschedule approved!");
      refetchReschedules();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to approve");
    }
  };

  const declineReschedule = async (id: string) => {
    try {
      await api.put(`/consultations/${id}/decline-reschedule`);
      toast.success("Reschedule declined!");
      refetchReschedules();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to decline");
    }
  };

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState />;

  const stats = [
    { label: "Today's Consults", value: data?.stats.todaysConsultations || 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Monthly Earnings", value: `₹${(earningsData?.thisMonthEarnings || data?.stats.monthlyEarnings || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Average Rating", value: data?.stats.averageRating ? data.stats.averageRating.toFixed(1) : "5.0", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Pending Requests", value: rescheduleRequests?.length || 0, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      {/* Header & Availability */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome, <span className="text-[#0D9488]">{data?.doctorName}</span>! 👨‍⚕️
          </h1>
          <p className="text-gray-500 font-medium italic">Manage your patient appointments and medical records.</p>
        </div>

        <Card className={cn(
          "border-none shadow-premium w-full lg:w-fit transition-all duration-300",
          data?.isAvailable ? "bg-[#e1fdfb]" : "bg-red-50"
        )}>
          <CardContent className="p-4 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                data?.isAvailable ? "bg-teal-500" : "bg-red-500"
              )} />
              <span className="font-bold text-gray-700">
                {data?.isAvailable ? "Available for consultations" : "You are currently Unavailable"}
              </span>
            </div>
            <Switch 
              checked={data?.isAvailable} 
              onCheckedChange={toggleAvailability}
              disabled={availabilityLoading}
              className="data-[state=checked]:bg-[#0D9488]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-6 flex items-center gap-4">
               <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                 <stat.icon size={24} />
               </div>
               <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-500">{stat.label}</p>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</h3>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content (List) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Instant Pending Queue */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden border-t-4 border-amber-400">
             <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 py-4 bg-amber-50/30">
                <div className="flex items-center gap-2">
                   <Clock className="text-amber-600" size={20} />
                   <CardTitle className="text-lg font-bold text-gray-900">Waiting for Instant Consultation</CardTitle>
                </div>
                <Badge className="bg-amber-100 text-amber-800 border-none font-bold">
                   {data?.pendingInstantConsultations.length || 0} Waiting
                </Badge>
             </CardHeader>
             <CardContent className="p-0">
                {data?.pendingInstantConsultations && data.pendingInstantConsultations.length > 0 ? (
                   <div className="divide-y divide-gray-50">
                     {data.pendingInstantConsultations.map((patient) => (
                       <div key={patient.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-amber-50/20 transition-colors animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-start gap-4">
                             <Avatar size="lg" className="border-2 border-amber-100">
                                <AvatarFallback className="bg-amber-100 text-amber-800 font-bold">
                                   {patient.patientName?.charAt(0)}
                                </AvatarFallback>
                             </Avatar>
                             <div>
                                <h4 className="font-bold text-gray-900">{patient.patientName}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                   <span>{patient.patientAge} yrs • {patient.patientGender}</span>
                                   <span className="text-gray-300">|</span>
                                   <span className="text-amber-600 font-bold">Waiting {patient.waitingTimeMinutes}m</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                   "{patient.chiefComplaint || "No complaint provided"}"
                                </p>
                             </div>
                          </div>
                          <Button 
                            onClick={() => acceptMutation.mutate(patient.id)} 
                            disabled={acceptMutation.isPending}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold w-full md:w-auto shadow-lg shadow-amber-200"
                          >
                             {acceptMutation.isPending ? "Accepting..." : "Accept Now"}
                          </Button>
                       </div>
                     ))}
                   </div>
                ) : (
                   <div className="p-10 text-center text-gray-400 font-medium italic">
                      Queue is empty. New patients will appear here automatically.
                   </div>
                )}
             </CardContent>
          </Card>

          {/* Today's Full Schedule */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
             <CardHeader className="border-b border-gray-50">
                <CardTitle className="text-lg font-bold">Today's Appointments</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                {data?.todaysSchedule && data.todaysSchedule.length > 0 ? (
                   <div className="divide-y divide-gray-50">
                      {data.todaysSchedule.filter(c => c.type !== "INSTANT" || c.status !== "PENDING").map((item) => (
                         <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-[#0D9488]/10 rounded-xl flex items-center justify-center text-[#0D9488]">
                                  <Clock size={20} />
                               </div>
                               <div>
                                  <h4 className="font-bold text-gray-900">{item.patientName} ({item.patientAge}y)</h4>
                                  <p className="text-sm font-bold text-gray-500">
                                     {new Date(item.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                               <Badge className={cn(
                                 "font-bold border-none",
                                 item.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                               )}>
                                 {item.status}
                               </Badge>
                               
                               {item.status !== "COMPLETED" && (
                                 <Button onClick={() => router.push(`/consultation/${item.id}`)} className="bg-[#0D9488] hover:bg-[#0b7a6e] font-bold h-9">
                                    Start
                                 </Button>
                               )}
                               <Button variant="ghost" size="sm" className="font-bold h-9 text-gray-500">History</Button>
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                   <div className="p-10 text-center text-gray-400">No scheduled appointments for today.</div>
                )}
             </CardContent>
          </Card>

          {/* Recent History */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
             <CardHeader className="border-b border-gray-50">
                <CardTitle className="text-lg font-bold">Recent Consultations</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                   {data?.recentConsultations.map((item) => (
                      <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                               <CheckCircle2 size={18} />
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-900">{item.patientName}</h4>
                               <p className="text-xs text-gray-500">{new Date(item.scheduledAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="font-bold border-gray-100">Details</Button>
                            {!item.prescriptionAdded && (
                               <Button size="sm" className="bg-purple-600 hover:bg-purple-700 font-bold">Add Prescription</Button>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             </CardContent>
          </Card>

           {/* ── NEW SECTIONS ── */}
           
           {/* Reschedule Requests */}
           <Card className="border-none shadow-sm shadow-rose-50 bg-white rounded-2xl overflow-hidden border-t-4 border-rose-400">
              <CardHeader className="border-b border-gray-50 py-4 bg-rose-50/10 flex flex-row items-center justify-between">
                 <CardTitle className="text-lg font-bold text-gray-900">Reschedule Requests</CardTitle>
                 {rescheduleRequests && rescheduleRequests.length > 0 && (
                    <Badge className="bg-rose-100 text-rose-800 border-none">{rescheduleRequests.length} Pending</Badge>
                 )}
              </CardHeader>
              <CardContent className="p-0">
                 {rescheduleRequests && rescheduleRequests.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                       {rescheduleRequests.map((req: any) => (
                          <div key={req.id} className="p-5 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                             <div>
                                <h4 className="font-bold text-gray-900">{req.patientName}</h4>
                                <p className="text-sm font-medium text-gray-500 mt-1">
                                   Requested: <span className="text-teal-600 font-bold">{new Date(req.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                </p>
                                {req.rescheduleReason && (
                                   <p className="text-xs text-gray-400 mt-1 bg-gray-50 p-1.5 rounded italic">"{req.rescheduleReason}"</p>
                                )}
                             </div>
                             <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                <Button size="sm" onClick={() => declineReschedule(req.id)} variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 w-full md:w-auto">
                                   Decline
                                </Button>
                                <Button size="sm" onClick={() => approveReschedule(req.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white w-full md:w-auto">
                                   Approve
                                </Button>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="p-6 text-center text-gray-400 font-medium tracking-tight">No pending reschedule requests.</div>
                 )}
              </CardContent>
           </Card>

           {/* Earnings Dashboard */}
           <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mt-8">
              <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
                 <CardTitle className="text-lg font-bold">Earnings Dashboard (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 {earningsData ? (
                    <div className="space-y-6">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50 text-center">
                             <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">This Month</p>
                             <p className="text-xl font-black text-gray-800">₹{earningsData.thisMonthEarnings?.toLocaleString()}</p>
                          </div>
                          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-center">
                             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Last Month</p>
                             <p className="text-xl font-black text-gray-800">₹{earningsData.lastMonthEarnings?.toLocaleString()}</p>
                          </div>
                          <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-50 text-center">
                             <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Lifetime</p>
                             <p className="text-xl font-black text-gray-800">₹{earningsData.totalEarnings?.toLocaleString()}</p>
                          </div>
                          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-50 text-center">
                             <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Avg/Consult</p>
                             <p className="text-xl font-black text-gray-800">₹{earningsData.averagePerConsultation?.toLocaleString()}</p>
                          </div>
                       </div>
                       
                       <div className="h-[250px] w-full mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={earningsData.monthlyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value: any) => `₹${value}`} />
                                <RechartsTooltip 
                                   cursor={{fill: '#F3F4F6'}}
                                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" fill="#0D9488" radius={[4, 4, 0, 0]} maxBarSize={50} />
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-400">Loading chart data...</div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* Earnings Breakdown */}
           <Card className="border-none shadow-premium bg-gradient-to-br from-[#0D9488] to-[#0f766e] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <CardHeader className="pb-0">
                 <CardTitle className="text-white/80 text-sm font-bold uppercase tracking-wider">Earnings This Month</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                 <h2 className="text-4xl font-extrabold">₹{(data?.stats.monthlyEarnings || 0).toLocaleString()}</h2>
                 <div className="mt-4 flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <div className="text-sm font-bold text-teal-100">12% vs last month</div>
                    <TrendingUp size={18} className="text-teal-200" />
                 </div>
              </CardContent>
           </Card>

           {/* Schedule Preview */}
           <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-50">
                 <CardTitle className="text-lg font-bold">Upcoming Days</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex flex-col items-center justify-center font-bold text-gray-600">
                             <span className="text-[10px] uppercase">{new Date(Date.now() + i * 86400000).toLocaleDateString([], {weekday: 'short'})}</span>
                             <span className="text-sm">{new Date(Date.now() + i * 86400000).getDate()}</span>
                          </div>
                          <div>
                             <p className="font-bold text-sm text-gray-900">{i * 3 + 2} Appointments</p>
                             <p className="text-xs text-gray-500">First at 09:30 AM</p>
                          </div>
                       </div>
                       <ChevronRight className="text-gray-300" size={16} />
                    </div>
                 ))}
              </CardContent>
           </Card>

           {/* Weekly Schedule Management */}
           <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden mt-6">
              <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
                 <CardTitle className="text-lg font-bold">Weekly Schedule</CardTitle>
                 <Button size="sm" variant="outline" onClick={() => setShowScheduleModal(true)} className="text-[#0D9488] border-[#0D9488] hover:bg-teal-50">
                    Set Hours
                 </Button>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                 {Object.entries(weeklySchedule).map(([day, details]: [string, any]) => (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                       <div className="flex items-center gap-3">
                          <div className={cn(
                             "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase text-white shadow-sm",
                             details.available ? "bg-teal-500" : "bg-gray-300"
                          )}>
                             {day.substring(0, 3)}
                          </div>
                          {details.available ? (
                             <div>
                                <p className="font-bold text-sm text-gray-900 capitalize">{day}</p>
                                <p className="text-xs text-teal-600 font-medium">{details.start} - {details.end}</p>
                             </div>
                          ) : (
                             <div>
                                <p className="font-medium text-sm text-gray-400 capitalize">{day}</p>
                                <p className="text-xs text-gray-400">Unavailable</p>
                             </div>
                          )}
                       </div>
                       <div className={cn("w-2 h-2 rounded-full", details.available ? "bg-teal-500" : "bg-gray-300")} />
                    </div>
                 ))}
              </CardContent>
           </Card>

           {/* Feedback Snippet */}
           <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
                 <CardTitle className="text-lg font-bold">Recent Feedback</CardTitle>
                 <Badge className="bg-amber-50 text-amber-600 border-none"><Star size={12} className="mr-1 fill-amber-600" /> 4.9</Badge>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                 <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[10px] bg-teal-50 text-[#0D9488]">JD</AvatarFallback>
                       </Avatar>
                       <span className="text-xs font-bold text-gray-700">John Doe</span>
                       <span className="text-[10px] text-gray-400">Today</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed italic">
                       "Dr. {data?.doctorName.split(' ')[1]} was extremely patient and explained everything clearly. Highly recommended!"
                    </p>
                 </div>
                 <Button variant="ghost" className="w-full text-xs font-bold text-[#0D9488] hover:bg-teal-50">
                    View All 128 Reviews
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Schedule Modal Component */}
      {showScheduleModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-premium w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xl font-extrabold text-gray-900">Set Weekly Availability</h3>
                  <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                     <XIcon size={24} />
                  </button>
               </div>
               <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                  {Object.entries(weeklySchedule).map(([day, details]: [string, any]) => (
                     <div key={day} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <div className="w-28 flex items-center justify-between">
                           <span className="font-bold text-gray-700 capitalize">{day}</span>
                           <Switch 
                              checked={details.available}
                              onCheckedChange={(val) => setWeeklySchedule((prev: any) => ({
                                 ...prev, [day]: { ...prev[day], available: val }
                              }))}
                           />
                        </div>
                        {details.available && (
                           <div className="flex items-center gap-2 flex-1">
                              <input 
                                 type="time" 
                                 value={details.start}
                                 onChange={(e) => setWeeklySchedule((prev: any) => ({
                                    ...prev, [day]: { ...prev[day], start: e.target.value }
                                 }))}
                                 className="flex-1 rounded-md border-gray-200 text-sm p-2 w-full focus:ring-teal-500 focus:border-teal-500"
                              />
                              <span className="text-gray-400 text-xs font-medium uppercase min-w-[20px] text-center">To</span>
                              <input 
                                 type="time" 
                                 value={details.end}
                                 onChange={(e) => setWeeklySchedule((prev: any) => ({
                                    ...prev, [day]: { ...prev[day], end: e.target.value }
                                 }))}
                                 className="flex-1 rounded-md border-gray-200 text-sm p-2 w-full focus:ring-teal-500 focus:border-teal-500"
                              />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
               <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                  <Button onClick={saveWeeklyHours} className="bg-teal-600 hover:bg-teal-700 font-bold text-white shadow-lg shadow-teal-200">Save Hours</Button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-screen bg-gray-50/50">
       <div className="flex justify-between items-center">
          <div className="h-10 bg-gray-200 animate-pulse rounded-xl w-64" />
          <div className="h-14 bg-gray-200 animate-pulse rounded-xl w-64" />
       </div>
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/60 shadow-sm border border-gray-100 animate-pulse rounded-2xl" />)}
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
             <div className="h-40 bg-white shadow-sm border border-gray-100 animate-pulse rounded-2xl" />
             <div className="h-96 bg-white shadow-sm border border-gray-100 animate-pulse rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
             <div className="h-40 bg-white shadow-sm border border-gray-100 animate-pulse rounded-2xl" />
             <div className="h-80 bg-white shadow-sm border border-gray-100 animate-pulse rounded-2xl" />
          </div>
       </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
       <AlertCircle size={48} className="text-red-500" />
       <h2 className="text-xl font-bold">Failed to load dashboard</h2>
       <p className="text-gray-500">Please try refreshing the page or contact support.</p>
       <Button onClick={() => window.location.reload()} className="bg-[#0D9488]">Retry</Button>
    </div>
  );
}
