"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInHours, parseISO, isAfter } from "date-fns";
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  Video, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  X,
  CreditCard,
  PhoneCall,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getInitials = (name: any) => {
  const safeName = String(name || '');
  if (!safeName || safeName.trim() === '' || safeName === 'null') return 'U';
  return safeName.trim().split(' ')
    .filter(Boolean)
    .map(n => n?.[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const timeSlots = Array.from({ length: 25 }, (_, i) => {
  const hours = Math.floor(i / 2) + 9;
  const mins = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${mins}`;
});

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");

  // Modals state
  const [cancelModal, setCancelModal] = useState<{ open: boolean; id?: string; scheduledAt?: string }>({ open: false });
  const [rescheduleModal, setRescheduleModal] = useState<{ open: boolean; id?: string; currentDate?: string }>({ open: false });
  
  // Reschedule Form State
  const [rDate, setRDate] = useState("");
  const [rTime, setRTime] = useState("");
  const [rReason, setRReason] = useState("");

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ["my-consultations"],
    queryFn: async () => {
      const res = await api.get("/consultations/my");
      return res.data;
    },
    enabled: !!user
  });

  // Categorize
  const now = new Date();
  const upcoming = consultations.filter((c: any) => c.status !== "CANCELLED" && c.status !== "COMPLETED" && isAfter(parseISO(c.scheduledAt), now) || c.status === "ONGOING");
  const past = consultations.filter((c: any) => c.status === "COMPLETED" || (c.status !== "CANCELLED" && !isAfter(parseISO(c.scheduledAt), now) && c.status !== "ONGOING"));
  const cancelled = consultations.filter((c: any) => c.status === "CANCELLED");

  const getActiveList = () => {
    switch(activeTab) {
      case "upcoming": return upcoming;
      case "past": return past;
      case "cancelled": return cancelled;
    }
  };

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/consultations/${id}/cancel`);
    },
    onSuccess: () => {
      toast.success("Consultation cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
      setCancelModal({ open: false });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to cancel consultation")
  });

  const rescheduleMutation = useMutation({
    mutationFn: async (payload: { id: string; req: any }) => {
      await api.post(`/consultations/${payload.id}/reschedule-request`, payload.req);
    },
    onSuccess: () => {
      toast.success("Reschedule request sent to doctor.");
      queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
      setRescheduleModal({ open: false });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to send request")
  });

  const handleConfirmCancel = () => {
    if (!cancelModal.id) return;
    cancelMutation.mutate(cancelModal.id);
  };

  const openCancelModal = (id: string, sAt: string) => {
    const hoursDiff = differenceInHours(parseISO(sAt), new Date());
    if (hoursDiff < 2) {
      toast.warning("Cancellation fee may apply for last minute cancellations.");
    }
    setCancelModal({ open: true, id, scheduledAt: sAt });
  };

  const submitReschedule = () => {
    if (!rescheduleModal.id || !rDate || !rTime) {
      toast.error("Please provide both preferred date and time.");
      return;
    }
    rescheduleMutation.mutate({
      id: rescheduleModal.id,
      req: { preferredDate: rDate, preferredTime: rTime, reason: rReason }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="bg-surface border-b border-border py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight mb-2">My Appointments</h1>
          <p className="text-muted-foreground font-medium">Manage your consultations, rescheduling, and history.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-6">
        {/* Tabs */}
        <div className="flex bg-surface-muted rounded-2xl shadow-sm border border-border p-1.5 gap-2 overflow-x-auto w-fit mb-8 relative z-10">
          <button 
            onClick={() => setActiveTab("upcoming")}
            className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all", activeTab === "upcoming" ? "bg-white text-accent shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-surface-muted/80")}
          >
            Upcoming ({upcoming.length})
          </button>
          <button 
            onClick={() => setActiveTab("past")}
            className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all", activeTab === "past" ? "bg-white text-accent shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-surface-muted/80")}
          >
            Past ({past.length})
          </button>
          <button 
            onClick={() => setActiveTab("cancelled")}
            className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all", activeTab === "cancelled" ? "bg-white text-accent shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-surface-muted/80")}
          >
            Cancelled ({cancelled.length})
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => <div key={i} className="h-40 bg-zinc-100 rounded-3xl animate-pulse" />)}
          </div>
        ) : getActiveList().length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <CalendarDays size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-900">No {activeTab} appointments</h3>
             <p className="text-gray-500 mt-2">You don't have any consultation records here.</p>
             <Button onClick={() => window.location.href='/consult'} className="mt-6 font-bold bg-[#0D9488] hover:bg-[#0b7a6e] rounded-xl px-8 h-12 shadow-sm">
                Book a Consultation
             </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {getActiveList().map((c: any) => (
              <Card key={c.consultationId} className={cn("overflow-hidden border-none shadow-sm transition-all bg-surface", c.status === "ONGOING" ? "ring-2 ring-primary shadow-primary/10" : "border border-border")}>
                <div className="flex flex-col md:flex-row">
                   {/* Left Date Pane */}
                   <div className="md:w-48 bg-surface-muted p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{format(parseISO(c.scheduledAt), "MMM")}</p>
                      <h3 className="text-4xl font-black text-foreground tracking-tighter mb-1">{format(parseISO(c.scheduledAt), "dd")}</h3>
                      <p className="font-bold text-muted-foreground">{format(parseISO(c.scheduledAt), "hh:mm a")}</p>
                      {c.type === "INSTANT" && <Badge variant="secondary" className="mt-4 bg-orange-100 text-orange-700 border-none font-bold text-[10px] uppercase tracking-wider">Instant</Badge>}
                      {c.type === "SCHEDULED" && <Badge variant="secondary" className="mt-4 bg-blue-100 text-blue-700 border-none font-bold text-[10px] uppercase tracking-wider">Scheduled</Badge>}
                   </div>

                   {/* Main Content */}
                   <div className="flex-1 p-6 relative">
                      {c.status === "ONGOING" && <div className="absolute top-6 right-6 flex items-center gap-2"><span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"/><span className="text-xs font-black text-green-600 uppercase tracking-widest">Active Now</span></div>}
                      {c.status === "COMPLETED" && <Badge className="absolute top-6 right-6 bg-green-50 border-green-200 text-green-700">Completed</Badge>}
                      {c.status === "CANCELLED" && <Badge className="absolute top-6 right-6 bg-red-50 border-red-200 text-red-700">Cancelled</Badge>}

                       <div className="flex gap-4">
                         {c.doctorProfilePictureUrl ? (
                           <img src={c.doctorProfilePictureUrl} className="w-14 h-14 rounded-full object-cover shadow-sm bg-surface-muted" alt="Doctor" />
                         ) : (
                           <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg">
                             {getInitials(c.doctorName)}
                           </div>
                         )}
                         <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mt-1">Consulting Physician</p>
                            <h4 className="text-xl font-heading font-extrabold text-foreground">Dr. {c.doctorName}</h4>
                            <p className="text-primary font-bold text-sm tracking-tight">{c.doctorSpecialization}</p>
                         </div>
                      </div>

                      {c.isRescheduleRequested && (
                        <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex gap-3 text-yellow-800">
                           <AlertCircle size={18} className="shrink-0 mt-0.5" />
                           <div className="text-sm">
                              <p className="font-bold">Reschedule Requested</p>
                              <p className="font-medium mt-1">Pending approval for {format(parseISO(c.proposedRescheduleTime), "MMM dd, hh:mm a")}</p>
                           </div>
                        </div>
                      )}

                      {/* Action Matrix Footer */}
                      <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                         {c.status === "ONGOING" && (
                           <Button onClick={() => window.open(`/consultation/${c.consultationId}`, "_blank")} className="bg-green-600 hover:bg-green-700 h-12 rounded-xl px-8 font-black shadow-lg shadow-green-500/20 active:scale-95 transition-all">
                             <Video size={18} className="mr-2" /> Join Video Room
                           </Button>
                         )}
                         
                         {c.status === "PENDING" && !c.isRescheduleRequested && (
                           <>
                              <Button 
                                variant="outline" 
                                onClick={() => openCancelModal(c.consultationId, c.scheduledAt)}
                                className="h-11 rounded-xl font-bold border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              >
                                Cancel Form
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-11 rounded-xl font-bold border-gray-200 text-gray-600 hover:bg-blue-50"
                                onClick={() => {
                                  setRDate(""); setRTime(""); setRReason("");
                                  setRescheduleModal({ open: true, id: c.consultationId, currentDate: format(parseISO(c.scheduledAt), "PPpp") });
                                }}
                              >
                                Request Reschedule
                              </Button>
                              <Button onClick={() => window.open(`/consultation/${c.consultationId}`, "_blank")} className="h-11 bg-primary hover:bg-primary/90 rounded-xl px-6 font-bold shadow-sm ml-auto">
                                Enter Waitroom
                              </Button>
                           </>
                         )}

                         {c.status === "COMPLETED" && (
                           <>
                             {c.prescriptionUrl && (
                                <Button variant="outline" onClick={() => window.open(c.prescriptionUrl, "_blank")} className="h-11 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-bold px-6">
                                  <FileText size={18} className="mr-2" /> View Prescription
                                </Button>
                             )}
                             <Button onClick={() => window.location.href='/consult'} className="h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 font-bold shadow-sm ml-auto">
                               Book Again
                             </Button>
                           </>
                         )}

                         {c.status === "CANCELLED" && (
                            <Button onClick={() => window.location.href='/consult'} className="h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 font-bold shadow-sm">
                               Rebook Appointment
                            </Button>
                         )}
                      </div>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelModal.open} onOpenChange={(open) => setCancelModal({ ...cancelModal, open })}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-8">
           <DialogHeader>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
                 <AlertCircle size={32} />
              </div>
              <DialogTitle className="text-2xl font-black">Cancel Appointment?</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium pt-2">
                 You are about to cancel this appointment. <br/>
                 <strong className="text-red-500 mt-2 block bg-red-50 p-3 rounded-lg border border-red-100">
                    Cancellations made less than 2 hours before the scheduled time may not be fully refunded and may be subject to platform fees.
                 </strong>
              </DialogDescription>
           </DialogHeader>
           <DialogFooter className="mt-4 gap-3">
              <Button variant="outline" className="h-12 rounded-xl font-bold w-full" onClick={() => setCancelModal({ open: false })}>Keep Appointment</Button>
              <Button 
                 variant="destructive" 
                 className="h-12 rounded-xl font-black shadow-lg shadow-red-500/20 w-full" 
                 onClick={handleConfirmCancel}
                 disabled={cancelMutation.isPending}
              >
                 {cancelMutation.isPending ? <Loader2 className="animate-spin w-5 h-5"/> : "Confirm Cancellation"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleModal.open} onOpenChange={(open) => setRescheduleModal({ ...rescheduleModal, open })}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-8 border-none bg-surface shadow-2xl">
           <DialogHeader>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
                 <CalendarDays size={32} />
              </div>
              <DialogTitle className="text-2xl font-heading font-black tracking-tight text-foreground">Request Reschedule</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium pt-2">
                 Propose a new time to the doctor. Your current appointment remains active until they approve this request.
              </DialogDescription>
           </DialogHeader>
           
           <div className="py-2 space-y-4">
              <div className="p-4 bg-surface-muted rounded-2xl flex items-center gap-3 border border-border text-sm font-medium text-muted-foreground">
                 <Clock size={18} className="text-muted-foreground shrink-0" />
                 <span><span className="font-bold text-foreground block text-xs tracking-widest uppercase mb-0.5">Current Time</span> {rescheduleModal.currentDate}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase text-muted-foreground">New Date</Label>
                     <input 
                       type="date" 
                       min={new Date().toISOString().split("T")[0]} 
                       value={rDate}
                       onChange={(e) => setRDate(e.target.value)}
                       className="w-full h-11 px-3 rounded-xl border border-border bg-surface shadow-sm font-semibold text-foreground outline-none focus:border-accent transition-colors"
                     />
                 </div>
                 <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase text-muted-foreground">New Time</Label>
                     <Select value={rTime} onValueChange={(val) => setRTime(val ?? '')}>
                         <SelectTrigger className="w-full h-11 bg-surface border-border rounded-xl font-semibold">
                             <SelectValue placeholder="Select" />
                         </SelectTrigger>
                         <SelectContent className="max-h-[200px]">
                             {timeSlots.map(time => (
                                 <SelectItem key={time} value={time}>{time}</SelectItem>
                             ))}
                         </SelectContent>
                     </Select>
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase text-muted-foreground">Reason (Optional)</Label>
                 <Textarea 
                   placeholder="Why do you need to reschedule?" 
                   value={rReason}
                   onChange={e => setRReason(e.target.value)}
                   className="resize-none rounded-2xl border-border focus:border-accent shadow-sm font-medium bg-surface" 
                   rows={3} 
                 />
              </div>
           </div>

           <DialogFooter className="mt-2">
              <Button 
                onClick={submitReschedule}
                disabled={rescheduleMutation.isPending}
                className="w-full h-14 bg-accent hover:bg-accent/90 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 active:scale-95 transition-all text-white"
              >
                {rescheduleMutation.isPending ? <Loader2 className="animate-spin w-5 h-5"/> : "Send Request to Doctor"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
