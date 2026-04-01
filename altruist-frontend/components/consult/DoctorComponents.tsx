"use client";

import React from "react";
import { Star, Clock, User, Award, IndianRupee, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface DoctorCardProps {
  doctor: {
    id: string;
    name: string;
    specialization: string;
    experienceYears: number;
    consultationFee: number;
    rating: number;
    profilePictureUrl: string | null;
    totalConsultations: number;
    isAvailable: boolean;
  };
  onConsult: (doctor: any) => void;
}

export const DoctorCard = ({ doctor, onConsult }: DoctorCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={cn(
          "fill-current",
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-200"
        )}
      />
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[12px] group bg-white">
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          {/* Header: Avatar & Info */}
          <div className="flex gap-4">
            <div className="relative">
              <Avatar size="lg" className="border-2 border-teal-50 shadow-sm">
                <AvatarImage src={doctor.profilePictureUrl || ""} alt={doctor.name} />
                <AvatarFallback className="bg-teal-50 text-teal-600 font-bold text-xl">
                  {doctor.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 h-5 w-5 border-2 border-white rounded-full shadow-sm",
                doctor.isAvailable ? "bg-green-500" : "bg-gray-400"
              )} title={doctor.isAvailable ? "Available Now" : "Currently Offline"} />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                  Dr. {doctor.name}
                </h3>
              </div>
              <Badge className="bg-teal-50 text-[#0D9488] border-none font-bold text-[10px] px-2 py-0">
                {doctor.specialization}
              </Badge>
              <div className="flex items-center gap-1.5 pt-1 text-sm text-gray-500 font-medium">
                <Award size={14} className="text-gray-400" />
                {doctor.experienceYears} years experience
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-50">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Consultation Fee</p>
              <p className="text-base font-black text-gray-900">{formatCurrency(doctor.consultationFee)}</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Rating & Reviews</p>
              <div className="flex items-center justify-end gap-1.5">
                <div className="flex">{renderStars(doctor.rating)}</div>
                <span className="text-sm font-bold text-gray-700">{doctor.rating}</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-primary/60" />
              {doctor.totalConsultations.toLocaleString()}+ consultations
            </div>
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md",
              doctor.isAvailable ? "text-green-600 bg-green-50" : "text-gray-500 bg-gray-50"
            )}>
              <Clock size={14} />
              {doctor.isAvailable ? "Available Now" : "Next Available Soon"}
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => onConsult(doctor)}
            className="w-full bg-[#0D9488] hover:bg-[#0b7a6e] text-white font-bold py-6 rounded-xl shadow-lg shadow-teal-500/10 active:scale-95 transition-all flex gap-2"
          >
            <Video size={18} />
            Consult Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const DoctorSkeleton = () => {
  return (
    <Card className="overflow-hidden border-none shadow-sm rounded-[12px] bg-white animate-pulse">
      <CardContent className="p-6 space-y-6">
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-3 py-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
        <div className="h-12 bg-gray-50 rounded-xl" />
        <div className="h-12 bg-gray-200 rounded-xl" />
      </CardContent>
    </Card>
  );
};
