"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Calendar, Clock, FileText, MessageSquare, ArrowRight, HeartPulse, Activity, 
  ChevronRight, Pill, FlaskConical, Stethoscope, ShoppingBag, Info, LifeBuoy, CreditCard, Droplets, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// Helper functions
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const formatDayDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).format(new Date(dateStr));
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(dateStr));
};

export default function PatientDashboard() {
  const router = useRouter();
  const { user: authUser, userType, loading: authLoading } = useAuth();
  
  const [greeting] = useState(getGreeting());
  const todayDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
    } else if (!authLoading && userType && userType !== "PATIENT") {
      router.push("/");
    }
  }, [authUser, userType, authLoading, router]);

  // Queries
  const { data: dash, isLoading: dashLoading, isError: dashError } = useQuery({
    queryKey: ["patient-dashboard"],
    queryFn: async () => (await api.get("/patients/dashboard")).data,
    enabled: !!authUser && userType === "PATIENT",
  });

  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      try {
        return (await api.get("/subscriptions/my")).data;
      } catch (e) { return null; }
    },
    enabled: !!authUser && userType === "PATIENT",
    retry: false
  });

  const { data: tickets, isLoading: tickLoading } = useQuery({
    queryKey: ["recent-tickets"],
    queryFn: async () => {
      try {
        return (await api.get("/support/tickets?limit=3")).data;
      } catch (e) { return []; }
    },
    enabled: !!authUser && userType === "PATIENT",
  });

  const { data: history, isLoading: histLoading } = useQuery({
    queryKey: ["recent-history"],
    queryFn: async () => {
      try {
        return (await api.get("/patients/consultations?size=5")).data.content;
      } catch (e) { return []; }
    },
    enabled: !!authUser && userType === "PATIENT",
  });

  if (dashError) {
    toast.error("Failed to load dashboard data");
  }

  if (authLoading || dashLoading) return <DashboardSkeleton />;
  if (!authUser || userType !== "PATIENT" || !dash) return null;

  // Stats
  const totalConsultations = dash.stats?.totalConsultations || 0;
  const upcomingAppointments = dash.stats?.upcomingAppointments || 0;
  const activePrescriptions = dash.stats?.activePrescriptions || 0;
  const pendingOrders = 0; // Fallback if API doesn't return orders

  const statsCards = [
    { label: "Total Consults", value: totalConsultations, icon: Stethoscope, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Upcoming Appts", value: upcomingAppointments, icon: Calendar, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Prescriptions", value: activePrescriptions, icon: FileText, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Pending Orders", value: pendingOrders, icon: ShoppingBag, color: "text-accent", bg: "bg-accent/10" },
  ];

  const firstName = authUser.displayName?.split(" ")[0] || "User";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 bg-surface min-h-screen">
      
      {/* 1. Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-border">
        <div>
          <p className="text-accent font-bold text-xs tracking-widest uppercase mb-1.5">{todayDate}</p>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {greeting}, <span className="text-primary">{firstName}</span>.
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Welcome to your personal health cockpit.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/consult">
            <Button className="font-bold h-11 px-6 rounded-xl shadow-md bg-accent hover:bg-accent/90 active:scale-95 transition-all">
              <MessageSquare className="w-4 h-4 mr-2" /> Book Chat Consult
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Banner Row: Health Tip & Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-transparent shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <Droplets className="w-32 h-32 text-blue-600" />
           </div>
           <CardContent className="p-8 relative z-10 flex flex-col justify-center h-full">
             <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none w-fit mb-4">Daily Health Tip</Badge>
             <h3 className="text-xl font-heading font-extrabold text-blue-950 mb-2">Stay Hydrated!</h3>
             <p className="text-blue-800/80 font-medium max-w-md">Drinking at least 8 glasses of water a day helps maintain energy levels and supports overall organ function. Keep a bottle nearby!</p>
           </CardContent>
        </Card>

        {!subLoading && sub && sub.status === "ACTIVE" ? (
          <Card className="border-transparent shadow-sm bg-gradient-to-br from-accent/90 to-primary/90 text-white rounded-3xl relative overflow-hidden">
             <CardContent className="p-8 flex flex-col justify-center h-full relative z-10">
                <Badge className="bg-white/20 text-white hover:bg-white/20 border-white/30 w-fit mb-4 backdrop-blur-md">Premium Active</Badge>
                <h3 className="text-2xl font-heading font-bold mb-1">{sub.planName}</h3>
                <p className="text-white/80 font-medium text-sm mb-4">Renews on {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                
                <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-white/90 uppercase tracking-wider">Consultations</span>
                    <span className="text-lg font-bold">{sub.consultationsRemaining} left</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full" 
                      style={{ width: `${(sub.consultationsUsed / (sub.consultationsUsed + sub.consultationsRemaining)) * 100}%` }}
                    />
                  </div>
                </div>
             </CardContent>
          </Card>
        ) : !subLoading ? (
          <Card className="border-border shadow-sm bg-surface rounded-3xl">
             <CardContent className="p-8 flex flex-col justify-center h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-2">Altruist Premium</h3>
                <p className="text-muted-foreground font-medium text-sm mb-6">Unlock unlimited consultations and flat 20% off all medicine orders.</p>
                <Link href="/plans">
                  <Button variant="outline" className="w-full font-bold border-accent text-accent hover:bg-accent/10">View Health Plans</Button>
                </Link>
             </CardContent>
          </Card>
        ) : <div className="bg-surface-muted rounded-3xl animate-pulse h-full min-h-[200px]" />}
      </div>

      {/* 3. Quick Actions Grid */}
      <div>
        <h3 className="font-heading font-bold text-foreground mb-4 text-lg">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { href: "/consult", icon: Stethoscope, label: "Book Doctor", color: "text-blue-600", bg: "bg-blue-50" },
            { href: "/medicines", icon: Pill, label: "Medicines", color: "text-primary", bg: "bg-primary/10" },
            { href: "/labs", icon: FlaskConical, label: "Lab Tests", color: "text-purple-600", bg: "bg-purple-50" },
            { href: "/patient/appointments", icon: Calendar, label: "My Appointments", color: "text-amber-600", bg: "bg-amber-50" },
            { href: "/plans", icon: CreditCard, label: "Health Plans", color: "text-accent", bg: "bg-accent/10" },
            { href: "/support", icon: LifeBuoy, label: "Help & Support", color: "text-slate-600", bg: "bg-slate-100" },
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <Card className="border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer rounded-2xl h-full group bg-surface">
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", action.bg, action.color)}>
                    <action.icon size={24} />
                  </div>
                  <span className="font-bold text-sm text-foreground">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <Card key={i} className="border border-border shadow-sm rounded-2xl bg-surface hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("p-3.5 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-black text-foreground">{stat.value}</h3>
                <p className="text-xs font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Appointments */}
          <Card className="border border-border shadow-sm bg-surface rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-border py-5 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-xl font-bold text-foreground">Upcoming Appointments</CardTitle>
                  <CardDescription className="font-medium mt-1">Your next scheduled video calls</CardDescription>
                </div>
                <Badge variant="outline" className="bg-surface-muted border-border font-bold text-muted-foreground hidden sm:inline-flex">
                  {dash?.upcomingConsultations?.length || 0} Scheduled
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {dash?.upcomingConsultations && dash.upcomingConsultations.length > 0 ? (
                <div className="divide-y divide-border">
                  {dash.upcomingConsultations.map((consult: any) => {
                    const isToday = new Date(consult.scheduledAt).toDateString() === new Date().toDateString();
                    const docParts = (consult.doctor?.name || "Doctor").replace("Dr. ", "").split(" ");
                    const docDisplayName = docParts.length > 1 
                      ? `Dr. ${docParts[0]} ${docParts[docParts.length - 1].charAt(0)}.` 
                      : `Dr. ${docParts[0]}`;

                    return (
                      <div key={consult.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-14 h-14 border-2 border-accent/20 shadow-sm">
                            <AvatarImage src={consult.doctor?.profilePicture || ""} />
                            <AvatarFallback className="bg-accent/10 text-accent font-bold text-lg">
                              {docDisplayName.replace('Dr. ', '').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-foreground text-lg">{docDisplayName}</h4>
                            <p className="text-sm text-muted-foreground font-medium">{consult.doctor?.specialization}</p>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end gap-1.5">
                          <div className="flex items-center gap-2 text-sm font-bold text-foreground bg-surface-muted px-3 py-1.5 rounded-lg w-fit border border-border">
                            <Calendar size={14} className="text-accent" />
                            {formatDayDate(consult.scheduledAt)}
                            <span className="mx-1 text-border">|</span>
                            <Clock size={14} className="text-accent" />
                            {formatTime(consult.scheduledAt)}
                          </div>
                          {isToday && <Badge className="bg-red-100 text-red-700 border-none font-bold w-fit mt-1">Today</Badge>}
                        </div>
                        <div>
                          {consult.canJoinNow ? (
                            <Link href={`/consultation/${consult.id}`}>
                              <Button className="bg-accent hover:bg-accent/90 font-bold w-full md:w-auto gap-2 rounded-xl h-11 px-6 shadow-md shadow-accent/20 active:scale-95 transition-all text-white">
                                <MessageSquare size={18} /> Open Chat
                              </Button>
                            </Link>
                          ) : (
                            <Button disabled variant="outline" className="border-border text-muted-foreground font-bold w-full md:w-auto rounded-xl h-11 px-6 bg-surface-muted cursor-not-allowed">
                              <Clock size={18} className="mr-2" /> Waiting
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState 
                  icon={<Calendar size={40} className="text-muted-foreground/50" />} 
                  title="No upcoming appointments" 
                  message="You don't have any consultations scheduled yet. Find a doctor and start a chat." 
                  actionLabel="Find a Doctor" 
                  actionUrl="/consult" 
                />
              )}
            </CardContent>
          </Card>

          {/* Recent History */}
          <Card className="border border-border shadow-sm bg-surface rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-border py-5 px-6">
              <CardTitle className="font-heading text-xl font-bold text-foreground">Consultation History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {histLoading ? (
                <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-accent w-8 h-8" /></div>
              ) : history && history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-muted text-muted-foreground font-bold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-4">Doctor</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {history.map((item: any) => (
                        <tr key={item.id} className="hover:bg-surface-muted/30 transition-colors font-medium">
                          <td className="px-6 py-4">
                            <span className="font-bold text-foreground block">Dr. {item.doctor?.user?.fullName || "Doctor"}</span>
                            <span className="text-xs text-muted-foreground">{item.doctor?.specialization || "General"}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-foreground">{formatDayDate(item.scheduledAt)}</span><br/>
                            <span className="text-xs text-muted-foreground">{formatTime(item.scheduledAt)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              item.status === 'COMPLETED' ? "bg-green-100 text-green-800 hover:bg-green-100 border-none" :
                              item.status === 'CANCELLED' ? "bg-red-100 text-red-800 hover:bg-red-100 border-none" :
                              "bg-blue-100 text-blue-800 hover:bg-blue-100 border-none"
                            }>
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={<FileText size={40} className="text-muted-foreground/50" />} title="No past consultations" message="Your consultation history will appear here once you complete a visit." />
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Active Prescriptions */}
          <Card className="border border-border shadow-sm bg-surface rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-border py-5 bg-surface-muted/30">
              <CardTitle className="font-heading text-lg font-bold text-foreground">Recent Prescriptions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dash?.recentPrescriptions && dash.recentPrescriptions.length > 0 ? (
                <div className="divide-y divide-border">
                  {dash.recentPrescriptions.slice(0,3).map((prescription: any) => (
                    <div key={prescription.id} className="p-5 hover:bg-surface-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-xl text-primary shrink-0 mt-1">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground">Dr. {prescription.doctorName}</h4>
                          <p className="text-xs font-bold text-muted-foreground mt-1 flex items-center gap-1.5">
                            <Calendar size={12}/> {formatDayDate(prescription.issuedAt)}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <Badge variant="secondary" className="font-bold text-xs bg-surface-muted text-foreground">
                              {prescription.medicinesCount} Medicines
                            </Badge>
                            {prescription.prescriptionUrl && (
                              <Button 
                                onClick={() => window.open(prescription.prescriptionUrl, "_blank")} 
                                variant="link" 
                                className="px-0 h-auto text-accent font-bold text-xs"
                              >
                                Download PDF
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/50">
                    <Pill size={24} />
                  </div>
                  <p className="font-medium text-muted-foreground text-sm">No prescriptions available.</p>
                </div>
              )}
              <div className="p-4 border-t border-border bg-surface-muted/30 text-center">
                <Link href="/medicines" className="text-sm font-bold text-accent hover:underline">Order Medicines &rarr;</Link>
              </div>
            </CardContent>
          </Card>

          {/* Support Tickets */}
          <Card className="border border-border shadow-sm bg-surface rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-border py-5 bg-surface-muted/30">
              <CardTitle className="font-heading text-lg font-bold text-foreground">Active Support</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tickLoading ? (
                <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-accent w-6 h-6" /></div>
              ) : tickets && tickets.length > 0 ? (
                <div className="divide-y divide-border">
                  {tickets.map((t: any) => (
                    <Link key={t.id} href="/support" className="block p-5 hover:bg-surface-muted/50 transition-colors">
                      <h4 className="font-bold text-foreground text-sm truncate mb-2">{t.subject}</h4>
                      <div className="flex items-center justify-between">
                        <Badge className={
                          t.status === 'OPEN' ? "bg-blue-100 text-blue-800 hover:bg-blue-100 border-none" : 
                          t.status === 'RESOLVED' ? "bg-green-100 text-green-800 hover:bg-green-100 border-none" :
                          "bg-surface-muted text-muted-foreground hover:bg-surface-muted border-none"
                        }>{t.status}</Badge>
                        <span className="text-xs font-bold text-muted-foreground">#{t.id.split('-')[0]}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/50">
                    <MessageSquare size={24} />
                  </div>
                  <p className="font-medium text-muted-foreground text-sm">No active support tickets.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ icon, title, message, actionLabel, actionUrl }: any) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
      <div className="bg-surface-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-border">
        {icon}
      </div>
      <h3 className="font-bold text-foreground text-lg">{title}</h3>
      <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm">{message}</p>
      {actionLabel && actionUrl && (
        <Link href={actionUrl}>
          <Button className="mt-2 bg-accent hover:bg-accent/90 font-bold h-10 px-6 rounded-xl shadow-sm text-white">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}

// Skeleton Loader
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 min-h-screen bg-surface">
      <div className="flex justify-between items-end pb-4 border-b border-border">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-surface-muted animate-pulse rounded" />
          <div className="h-10 w-64 bg-surface-muted animate-pulse rounded-xl" />
        </div>
        <div className="h-11 w-40 bg-surface-muted animate-pulse rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-40 bg-surface-muted animate-pulse rounded-3xl" />
        <div className="h-40 bg-surface-muted animate-pulse rounded-3xl" />
      </div>
      <div className="h-8 w-40 bg-surface-muted animate-pulse rounded-md" />
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-surface-muted animate-pulse rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-muted animate-pulse rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-64 bg-surface-muted animate-pulse rounded-3xl" />
          <div className="h-80 bg-surface-muted animate-pulse rounded-3xl" />
        </div>
        <div className="space-y-8">
          <div className="h-72 bg-surface-muted animate-pulse rounded-3xl" />
          <div className="h-64 bg-surface-muted animate-pulse rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
