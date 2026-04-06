"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Star, ArrowLeft, Stethoscope, Clock, IndianRupee, CheckCircle2,
  MessageSquare, Calendar, Loader2, Shield, UserCheck
} from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const AVATAR_COLORS: Record<string, string> = {
  A:"#EF4444",B:"#F97316",C:"#F59E0B",D:"#22C55E",E:"#14B8A6",F:"#06B6D4",
  G:"#3B82F6",H:"#6366F1",I:"#8B5CF6",J:"#A855F7",K:"#D946EF",L:"#EC4899",
  M:"#F43F5E",N:"#10B981",O:"#0EA5E9",P:"#00A87E",Q:"#7C3AED",R:"#DB2777",
  S:"#059669",T:"#0D9488",U:"#2563EB",V:"#7C3AED",W:"#DC2626",X:"#9333EA",
  Y:"#CA8A04",Z:"#65A30D",
};
const getAvatarColor = (name: string) => AVATAR_COLORS[name?.charAt(0)?.toUpperCase() || "A"] || "#0D9488";

const timeSlots = Array.from({ length: 25 }, (_, i) => {
  const hours = Math.floor(i / 2) + 9;
  const mins = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${mins}`;
});

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const doctorId = params.id as string;

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingType, setBookingType] = useState<"INSTANT" | "SCHEDULED">("INSTANT");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // Fetch doctor details
  const { data: doctor, isLoading, isError } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: async () => {
      const res = await api.get(`/doctors/${doctorId}`);
      return res.data;
    },
    enabled: !!doctorId,
  });

  // Book + open chat mutation
  const bookMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { doctorId, consultationType: bookingType };
      if (bookingType === "SCHEDULED") {
        payload.scheduledAt = `${scheduledDate}T${scheduledTime}:00`;
      }
      const res = await api.post("/consultations/instant", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Consultation booked! Opening chat…");
      setIsBookingOpen(false);
      router.push(`/consultation/${data.consultationId}`);
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) toast.error("Doctor is no longer available right now.");
      else toast.error(err?.response?.data?.message || "Booking failed. Please try again.");
    },
  });

  const handleConsultClick = () => {
    if (!user) { router.push("/login?redirect=/doctors/" + doctorId); return; }
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = () => {
    if (bookingType === "SCHEDULED" && (!scheduledDate || !scheduledTime)) {
      toast.error("Please select date and time for your scheduled consultation.");
      return;
    }
    bookMutation.mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#0D9488]" />
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <Stethoscope size={48} className="text-gray-300" />
        <p className="font-bold text-gray-700">Doctor not found</p>
        <Button variant="outline" onClick={() => router.push("/consult")}>Browse Doctors</Button>
      </div>
    );
  }

  const color = getAvatarColor(doctor.name || "D");
  const initial = (doctor.name || "D").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div
        className="relative h-48 flex items-end"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #064E3B 50%, #0F172A 100%)" }}
      >
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="max-w-4xl mx-auto px-6 w-full pb-8 relative z-10">
          <button
            onClick={() => router.push("/consult")}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Back to Doctors
          </button>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Profile Card */}
          <div className="lg:col-span-1 space-y-4">
            {/* Doctor card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
              >
                {initial}
              </div>

              <h1 className="text-xl font-extrabold text-gray-900">Dr. {doctor.name}</h1>
              <Badge className="bg-[#E6F7F5] text-[#0D9488] border-none font-bold mt-1 mb-3">
                {doctor.specialization}
              </Badge>

              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} className={cn("fill-amber-400 text-amber-400", i > 4 && "fill-gray-200 text-gray-200")} />
                ))}
                <span className="text-sm font-bold text-gray-600 ml-1">{doctor.rating?.toFixed(1) || "4.8"}</span>
              </div>

              {/* Available badge */}
              {doctor.isAvailable ? (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-bold text-green-600">Available Now</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-500">Currently Unavailable</span>
                </div>
              )}

              {/* Fee */}
              <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Consultation Fee</p>
                <p className="text-2xl font-extrabold text-gray-900 flex items-center justify-center gap-1">
                  <IndianRupee size={18} />
                  {doctor.consultationFee || 500}
                </p>
              </div>

              {/* CTA */}
              <Button
                onClick={handleConsultClick}
                disabled={!doctor.isAvailable}
                className="w-full h-12 bg-[#0D9488] hover:bg-[#0b7a6e] font-bold rounded-xl gap-2 shadow-lg shadow-[#0D9488]/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <MessageSquare size={18} />
                {doctor.isAvailable ? "Start Chat Consultation" : "Currently Unavailable"}
              </Button>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              {[
                { icon: Clock, label: "Experience", value: `${doctor.experienceYears || 5}+ years` },
                { icon: UserCheck, label: "Patients Treated", value: "1,200+" },
                { icon: CheckCircle2, label: "Consultations", value: "2,400+" },
                { icon: Shield, label: "Verified", value: "MBBS Certified" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0D9488]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} className="text-[#0D9488]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <Stethoscope size={18} className="text-[#0D9488]" />
                About Dr. {doctor.name}
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                {doctor.bio || `Dr. ${doctor.name} is a highly experienced ${doctor.specialization} specialist with over ${doctor.experienceYears || 5} years of clinical practice. They are known for their patient-centric approach and evidence-based treatment plans. Patients appreciate their clarity in explaining medical conditions and their dedication to quality care.`}
              </p>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">How Chat Consultation Works</h2>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Book & Confirm", desc: "Select instant or schedule for later. Pay the consultation fee securely." },
                  { step: "2", title: "Chat with Doctor", desc: "Chat directly with the doctor — ask questions, share symptoms, and get clarity." },
                  { step: "3", title: "Receive Prescription", desc: "Doctor sends you a prescription note, images, or files right in the chat." },
                  { step: "4", title: "Follow Up", desc: "Continue the conversation for follow-up questions within the consultation window." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{s.title}</p>
                      <p className="text-sm text-gray-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Booking Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={isBookingOpen} onOpenChange={(o) => {
        setIsBookingOpen(o);
        if (!o) { setBookingType("INSTANT"); setScheduledDate(""); setScheduledTime(""); }
      }}>
        <DialogContent className="sm:max-w-[460px] rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                {initial}
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-gray-900">Dr. {doctor?.name}</DialogTitle>
                <p className="text-sm font-bold text-[#0D9488] uppercase tracking-widest">{doctor?.specialization}</p>
              </div>
            </div>
            <DialogDescription className="text-gray-500">Choose your consultation type and confirm to start chatting.</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-5">
            {/* Instant vs Scheduled */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setBookingType("INSTANT")}
                className={cn("h-14 rounded-2xl border-2 font-bold text-sm transition-all",
                  bookingType === "INSTANT"
                    ? "border-[#0D9488] bg-[#E6F7F5] text-[#0D9488]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300")}>
                <MessageSquare size={16} className="inline mr-2" />Connect Now
              </button>
              <button onClick={() => setBookingType("SCHEDULED")}
                className={cn("h-14 rounded-2xl border-2 font-bold text-sm transition-all",
                  bookingType === "SCHEDULED"
                    ? "border-[#0D9488] bg-[#E6F7F5] text-[#0D9488]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300")}>
                <Calendar size={16} className="inline mr-2" />Schedule Later
              </button>
            </div>

            {/* Scheduled date/time pickers */}
            {bookingType === "SCHEDULED" && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Select Date</Label>
                  <input type="date" min={new Date().toISOString().split("T")[0]} value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold outline-none focus:border-[#0D9488]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Select Time</Label>
                  <Select value={scheduledTime} onValueChange={(v) => setScheduledTime(v ?? "")}>
                    <SelectTrigger className="w-full h-10 bg-white border-gray-200 rounded-xl font-semibold text-sm">
                      <SelectValue placeholder="Pick a time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Fee summary */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm font-semibold text-gray-600">
                <span>Consultation Fee</span><span className="text-gray-900">₹{doctor?.consultationFee || 500}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-gray-600">
                <span>Platform Fee</span><span className="text-gray-900">₹49</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="font-extrabold text-gray-900">Total</span>
                <span className="text-xl font-extrabold text-[#0D9488]">₹{(doctor?.consultationFee || 500) + 49}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleConfirmBooking} disabled={bookMutation.isPending}
              className="w-full h-13 bg-[#0D9488] hover:bg-[#0b7a6e] font-extrabold rounded-2xl text-base shadow-xl shadow-[#0D9488]/20 active:scale-95 transition-all gap-2">
              {bookMutation.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Processing…</>
              ) : (
                <><MessageSquare size={18} /> Confirm & Start Chat</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
