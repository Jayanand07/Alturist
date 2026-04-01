"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  Filter, 
  Search, 
  ChevronDown, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  Info,
  Video,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { DoctorCard, DoctorSkeleton } from "@/components/consult/DoctorComponents";

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Gynecology",
  "Neurology",
  "Orthopedics",
  "Psychiatry"
];

const EXPERIENCE_RANGES = [
  { label: "All experience", value: "all" },
  { label: "0-5 years", value: "0-5" },
  { label: "5-10 years", value: "5-10" },
  { label: "10+ years", value: "10+" },
];

export default function ConsultPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Page State
  const [page, setPage] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  
  // Booking Form State
  const [bookingType, setBookingType] = useState<"INSTANT" | "SCHEDULED">("INSTANT");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hours = Math.floor(i / 2) + 9;
    const mins = i % 2 === 0 ? "00" : "30";
    return `${hours.toString().padStart(2, "0")}:${mins}`;
  });

  // Filter State
  const [specialization, setSpecialization] = useState<string>("all");
  const [experience, setExperience] = useState<string>("all");
  const [maxFee, setMaxFee] = useState<number>(2000);
  const [availableOnly, setAvailableOnly] = useState(true);

  // Applied Filter State (to trigger refetch on button click)
  const [appliedFilters, setAppliedFilters] = useState({
    specialization: "all",
    maxFee: 2000,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctors", page, appliedFilters],
    queryFn: async () => {
      const params: any = {
        page,
        size: 9,
        maxFee: appliedFilters.maxFee,
      };
      if (appliedFilters.specialization !== "all") {
        params.specialization = appliedFilters.specialization;
      }
      
      const response = await api.get("/doctors/available", { params });
      return response.data;
    },
  });

  const handleApplyFilters = () => {
    setAppliedFilters({ specialization, maxFee });
    setPage(0); // Reset to first page
  };

  const handleConsultClick = (doctor: any) => {
    if (!user) {
      router.push("/login?redirect=/consult");
      return;
    }
    setSelectedDoctor(doctor);
    setIsBookingOpen(true);
  };

  const handleBookConsultation = async () => {
    if (!selectedDoctor) return;
    
    if (bookingType === "SCHEDULED" && (!scheduledDate || !scheduledTime)) {
        toast.error("Please select both date and time for scheduled consultation.");
        return;
    }

    setIsBooking(true);
    try {
      const payload: any = {
        doctorId: selectedDoctor.id,
        consultationType: bookingType,
      };

      if (bookingType === "SCHEDULED") {
        payload.scheduledAt = `${scheduledDate}T${scheduledTime}:00`;
      }

      const response = await api.post("/consultations/instant", payload);
      
      if (bookingType === "INSTANT") {
          toast.success("Consultation booked! Connecting to video room...");
          setIsBookingOpen(false);
          router.push(`/consultation/${response.data.consultationId}`);
      } else {
          toast.success("Consultation scheduled successfully!");
          setIsBookingOpen(false);
          router.push("/patient/appointments");
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error("This doctor is no longer available. Please try another.");
      } else {
        toast.error(error?.response?.data?.message || "Failed to book consultation");
      }
    } finally {
      setIsBooking(false);
    }
  };

  const doctors = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Consult <span className="text-primary">Top Doctors</span> Online
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            Connect with verified specialists in 60 seconds. Secure and private video consultations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar (Desktop hide/show or sticky) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Filter size={18} className="text-primary" />
                  Filters
                </h3>
                <Button variant="ghost" size="sm" className="text-xs h-8 text-primary font-bold hover:bg-teal-50"
                  onClick={() => {
                    setSpecialization("all");
                    setExperience("all");
                    setMaxFee(2000);
                    handleApplyFilters();
                  }}
                >
                  Reset
                </Button>
              </div>

              {/* Specialization */}
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase text-gray-400">Specialization</Label>
                <Select value={specialization} onValueChange={(val: string | null) => setSpecialization(val ?? "all")}>
                  <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 hover:bg-white transition-all font-semibold">
                    <SelectValue placeholder="Select Specialization" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Any Specialty</SelectItem>
                    {SPECIALIZATIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fee Range */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-black uppercase text-gray-400">
                  <Label>Max Fee</Label>
                  <span className="text-primary text-sm font-black">₹{maxFee}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="5000" 
                  step="100"
                  value={maxFee}
                  onChange={(e) => setMaxFee(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <span>₹0</span>
                  <span>₹5000+</span>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-gray-700">Available Now</Label>
                  <p className="text-[10px] text-teal-600 font-medium leading-none">Show active doctors only</p>
                </div>
                <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
              </div>

              <Button 
                onClick={handleApplyFilters}
                className="w-full bg-[#0D9488] hover:bg-[#0b7a6e] font-bold h-12 rounded-xl"
              >
                Apply Filters
              </Button>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg space-y-4">
               <Info size={32} className="opacity-50" />
               <h3 className="font-bold text-lg leading-tight">Need help choosing a doctor?</h3>
               <p className="text-sm text-blue-100 font-medium">Talk to our care coordinators for free assistance.</p>
               <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl">Call +91 800 123 4567</Button>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="lg:col-span-3 space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <DoctorSkeleton key={i} />)}
              </div>
            ) : isError ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-red-50">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <X size={32} />
                </div>
                <h3 className="text-xl font-bold">Failed to load doctors</h3>
                <p className="text-gray-500">Something went wrong. Please try again later.</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="bg-white p-20 rounded-[32px] text-center space-y-6 border-2 border-dashed border-gray-100 flex flex-col items-center">
                 <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <Stethoscope size={48} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">No doctors found</h3>
                    <p className="text-gray-500 max-w-sm font-medium">Try adjusting your filters to find specialists in other categories or price ranges.</p>
                 </div>
                 <Button variant="outline" onClick={() => {
                   setSpecialization("all");
                   setMaxFee(2000);
                   handleApplyFilters();
                 }} className="border-primary text-primary hover:bg-teal-50 font-black px-8 h-12 rounded-xl">
                   Clear All Filters
                 </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {doctors.map((doctor: any) => (
                    <DoctorCard 
                      key={doctor.id} 
                      doctor={doctor} 
                      onConsult={handleConsultClick} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="rounded-xl font-bold gap-2"
                    >
                      <ChevronLeft size={18} /> Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <Button 
                          key={i}
                          variant={page === i ? "default" : "ghost"}
                          onClick={() => setPage(i)}
                          className={cn("h-10 w-10 rounded-xl font-bold", page === i && "bg-primary text-white hover:bg-primary")}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page === totalPages - 1}
                      className="rounded-xl font-bold gap-2"
                    >
                      Next <ChevronRight size={18} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={isBookingOpen} onOpenChange={(open) => {
          setIsBookingOpen(open);
          if (!open) {
              setBookingType("INSTANT");
              setScheduledDate("");
              setScheduledTime("");
          }
      }}>
        <DialogContent className="sm:max-w-[480px] rounded-[32px] p-8 border-none shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-primary shrink-0">
                   <Video size={32} />
                </div>
                <div>
                   <DialogTitle className="text-2xl font-black tracking-tight text-gray-900">Dr. {selectedDoctor?.name}</DialogTitle>
                   <p className="text-sm font-bold text-teal-600 uppercase tracking-widest">{selectedDoctor?.specialization}</p>
                </div>
            </div>
            <DialogDescription className="text-gray-500 font-medium">
              Choose your preferred consultation method below to proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-6">
             {/* Type Selection */}
             <div className="grid grid-cols-2 gap-3">
                 <Button 
                   variant="outline"
                   onClick={() => setBookingType("INSTANT")}
                   className={cn("h-14 rounded-2xl border-2 font-bold", bookingType === "INSTANT" ? "border-primary bg-teal-50 text-primary" : "border-gray-100 text-gray-500")}
                 >
                     <Video size={18} className="mr-2" /> Connect Now
                 </Button>
                 <Button 
                   variant="outline"
                   onClick={() => setBookingType("SCHEDULED")}
                   className={cn("h-14 rounded-2xl border-2 font-bold", bookingType === "SCHEDULED" ? "border-primary bg-teal-50 text-primary" : "border-gray-100 text-gray-500")}
                 >
                     Schedule Later
                 </Button>
             </div>

             {/* Scheduling Inputs */}
             {bookingType === "SCHEDULED" && (
                 <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                     <div className="space-y-2">
                         <Label className="text-xs font-black uppercase text-gray-400">Select Date</Label>
                         <input 
                           type="date" 
                           min={new Date().toISOString().split("T")[0]} 
                           value={scheduledDate}
                           onChange={(e) => setScheduledDate(e.target.value)}
                           className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white shadow-sm font-semibold text-gray-700 outline-none focus:border-primary"
                         />
                     </div>
                     <div className="space-y-2">
                         <Label className="text-xs font-black uppercase text-gray-400">Select Time Slot</Label>
                         <Select value={scheduledTime} onValueChange={(val) => setScheduledTime(val ?? "")}>
                             <SelectTrigger className="w-full h-11 bg-white border-gray-200 rounded-xl font-semibold">
                                 <SelectValue placeholder="Pick a time" />
                             </SelectTrigger>
                             <SelectContent className="max-h-[200px]">
                                 {timeSlots.map(time => (
                                     <SelectItem key={time} value={time}>{time}</SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                     </div>
                 </div>
             )}

             {/* Fee Split */}
             <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex justify-between text-sm font-bold text-gray-500">
                   <span>Consultation Fee</span>
                   <span className="text-gray-900">₹{selectedDoctor?.consultationFee || 500}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-500">
                   <span>Platform Fee</span>
                   <span className="text-gray-900">₹49</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-gray-900">
                   <span className="font-black">Total Payable</span>
                   <span className="text-2xl font-black text-primary">₹{(selectedDoctor?.consultationFee || 500) + 49}</span>
                </div>
             </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleBookConsultation}
              disabled={isBooking}
              className="w-full bg-[#0D9488] hover:bg-[#0b7a6e] font-black h-14 rounded-2xl text-lg shadow-xl shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-60"
            >
              {isBooking ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </span>
              ) : (
                "Confirm & Pay"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
