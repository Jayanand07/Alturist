"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Calendar, Clock, MapPin, Phone, 
  Loader2, CheckCircle2, FlaskConical, AlertCircle
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import api from "@/lib/axios";
import { toast } from "sonner";

interface LabBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    price: number;
    type: "TEST" | "PACKAGE";
  } | null;
}

const TIME_SLOTS = [
  "Morning 7 AM - 9 AM",
  "Morning 9 AM - 11 AM",
  "Afternoon 12 PM - 2 PM",
  "Afternoon 2 PM - 4 PM",
  "Evening 4 PM - 6 PM"
];

export default function LabBookingModal({ isOpen, onClose, item }: LabBookingModalProps) {
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(TIME_SLOTS[1]); // Default 9-11 AM
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  
  // Loading & state management
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ id: string } | null>(null);

  // Set min date to today
  const minDate = new Date().toISOString().split("T")[0];

  // Prefill details from profile when open
  useEffect(() => {
    if (isOpen && !bookingResult) {
      setLoadingProfile(true);
      api.get("/patients/profile")
        .then((res) => {
          const profile = res.data;
          if (profile) {
            if (profile.phone) {
              setPhone(profile.phone);
            }
            
            // Build full address
            const parts = [
              profile.street,
              profile.city,
              profile.state,
              profile.pincode
            ].filter(p => p && p.trim().length > 0);
            
            if (parts.length > 0) {
              setAddress(parts.join(", "));
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load user profile for booking prefill:", err);
        })
        .finally(() => {
          setLoadingProfile(false);
        });
      
      // Initialize preferred date to today or tomorrow
      setPreferredDate(minDate);
    } else if (!isOpen) {
      // Reset when modal closes
      setBookingResult(null);
      setPreferredDate("");
      setAddress("");
      setPhone("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (!preferredDate) return toast.error("Please select a preferred date");
    if (!preferredTimeSlot) return toast.error("Please select a preferred time slot");
    if (!address.trim()) return toast.error("Please enter a collection address");
    if (!phone.trim()) return toast.error("Please enter a contact phone number");

    setSubmitting(true);

    const payload = {
      labTestId: item.type === "TEST" ? item.id : null,
      labPackageId: item.type === "PACKAGE" ? item.id : null,
      preferredDate,
      preferredTimeSlot,
      address,
      phone
    };

    try {
      const res = await api.post("/lab-bookings", payload);
      setBookingResult(res.data);
      toast.success("Lab booking request sent successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit lab booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl border border-slate-100 p-6 bg-white gap-6 max-h-[90vh] overflow-y-auto scrollbar-none">
        
        {bookingResult ? (
          /* SUCCESS SCREEN */
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-100 mx-auto">
              <CheckCircle2 size={36} className="animate-bounce" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="font-heading text-2xl font-extrabold text-slate-900 leading-tight">
                Booking Request Sent!
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium text-sm px-4">
                Your booking request has been successfully created. Our wellness support team will contact you shortly to confirm sample collection.
              </DialogDescription>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Booking ID / Reference</p>
              <p className="font-mono text-sm font-bold text-slate-800 break-all">{bookingResult.id}</p>
              
              <div className="border-t border-slate-200/60 my-2 pt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Booked Item</span>
                  <span className="text-slate-800 font-extrabold">{item.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Total Amount</span>
                  <span className="text-slate-900 font-extrabold">₹{item.price}</span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-slate-400 font-bold block">Scheduled Slot</span>
                  <span className="text-slate-800 font-extrabold">{preferredDate} ({preferredTimeSlot.split(" ").slice(1).join(" ")})</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={onClose}
              className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow border-none active:scale-95 transition-all text-sm"
            >
              Back to Dashboard
            </Button>
          </div>
        ) : (
          /* FORM SCREEN */
          <>
            <DialogHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="font-heading text-lg font-black text-slate-900 leading-tight">
                    Confirm Lab Booking
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs font-bold mt-0.5">
                    For {item.name} • <span className="text-slate-900 font-extrabold">₹{item.price}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {loadingProfile ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-sm text-slate-400 font-medium">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>Loading profile details...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Date Selection */}
                <div className="space-y-1">
                  <Label htmlFor="prefDate" className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" /> Preferred Collection Date *
                  </Label>
                  <Input 
                    id="prefDate"
                    type="date"
                    min={minDate}
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="rounded-xl border-slate-200 h-11 font-semibold text-slate-700 focus:ring-2 focus:ring-[#E8593C]/10 outline-none"
                  />
                </div>

                {/* Time Slot Selector */}
                <div className="space-y-1">
                  <Label htmlFor="prefSlot" className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" /> Preferred Time Slot *
                  </Label>
                  <Select
                    value={preferredTimeSlot}
                    onValueChange={(val) => setPreferredTimeSlot(val || "")}
                  >
                    <SelectTrigger id="prefSlot" className="rounded-xl border-slate-200 h-11 font-semibold text-slate-700">
                      <SelectValue placeholder="Select Time Slot" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border-slate-200">
                      {TIME_SLOTS.map(slot => (
                        <SelectItem key={slot} value={slot} className="rounded-lg font-medium">{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address Selection */}
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" /> Sample Collection Address *
                  </Label>
                  <Textarea
                    id="address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete home address for hygienic sample pickup..."
                    className="rounded-xl border-slate-200 min-h-[70px] text-slate-700 font-semibold focus:ring-2 focus:ring-[#E8593C]/10"
                  />
                </div>

                {/* Phone Selection */}
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> Contact Phone Number *
                  </Label>
                  <Input 
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="rounded-xl border-slate-200 h-11 text-slate-700 font-semibold focus:ring-2 focus:ring-[#E8593C]/10 outline-none"
                  />
                </div>

                {/* Note about collection */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-blue-800 leading-relaxed font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                  <span>Note: Our certified partner lab representative will follow all safety guidelines. Please maintain 10-12 hours of fasting if required by this test/package.</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1 rounded-xl border-slate-200 font-bold h-11 active:scale-95 transition-all text-xs"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow border-none h-11 active:scale-95 transition-all text-xs"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : "Confirm & Book"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
