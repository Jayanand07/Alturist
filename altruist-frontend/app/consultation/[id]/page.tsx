"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  ShieldAlert,
  Calendar,
  IndianRupee,
  User as UserIcon,
  ArrowLeft,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import ConsultationChat from "@/components/chat/ConsultationChat";
import PrescriptionModal from "@/components/consultation/PrescriptionModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function ConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userType, loading: authLoading } = useAuth();
  const consultationId = params.id as string;
  const [showPrescription, setShowPrescription] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/consultation/" + consultationId);
    }
  }, [authLoading, user, consultationId, router]);

  // Fetch consultation details
  const {
    data: consultation,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["consultation", consultationId],
    queryFn: async () => {
      const res = await api.get(`/consultations/${consultationId}`);
      return res.data;
    },
    enabled: !!consultationId && !!user,
    retry: false,
    refetchInterval: 15000,
  });

  // Handle 403 — not authorized for this consultation
  useEffect(() => {
    if (isError && (error as any)?.response?.status === 403) {
      toast.error("You don't have access to this consultation");
      router.push("/");
    }
  }, [isError, error, router]);

  // ── Loading & Error States ──────────────────────────────────────────────

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-surface-muted/30 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 animate-pulse" />
          <Loader2 size={32} className="text-primary animate-spin absolute inset-0 m-auto" />
        </div>
        <p className="text-muted-foreground font-medium">Connecting to consultation…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-surface-muted/30 flex flex-col items-center justify-center gap-4">
        <ShieldAlert size={48} className="text-red-400" />
        <p className="text-muted-foreground font-semibold text-lg">Unable to load this consultation</p>
        <Button variant="outline" onClick={() => router.push("/")} className="mt-2">
          Go Home
        </Button>
      </div>
    );
  }

  if (!consultation) return null;

  const isDoctor = userType === "DOCTOR";

  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING:   { label: "Waiting", color: "bg-amber-100 text-amber-800" },
    ONGOING:   { label: "In Progress", color: "bg-green-100 text-green-800" },
    COMPLETED: { label: "Completed", color: "bg-blue-100 text-blue-800" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  };
  const currentStatus = statusConfig[consultation.status] || statusConfig.PENDING;

  return (
    <div className="min-h-screen bg-surface-muted/30 flex flex-col">
      {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
      <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-surface-muted hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={18} className="text-muted-foreground" />
        </button>

        <div className="flex-1">
          <h1 className="font-bold text-foreground text-base leading-tight">
            {isDoctor ? `Patient: ${consultation.patientName}` : `Dr. ${consultation.doctorName}`}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{consultation.doctorSpecialization}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* Consultation info pills */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs bg-surface-muted px-2.5 py-1 rounded-full font-medium text-muted-foreground">
            <IndianRupee size={11} />
            {consultation.amount}
          </span>
          <span className="flex items-center gap-1 text-xs bg-surface-muted px-2.5 py-1 rounded-full font-medium text-muted-foreground">
            <Calendar size={11} />
            {new Date(consultation.scheduledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          </span>
        </div>

        {/* Doctor: write prescription button */}
        {isDoctor && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrescription(true)}
            className="border-primary text-primary hover:bg-[#E6F7F5] font-bold rounded-2xl gap-1.5 h-8"
          >
            <ClipboardList size={14} />
            <span className="hidden sm:inline">Prescription</span>
          </Button>
        )}
      </div>

      {/* ── Chat (takes all remaining height) ──────────────────────────────── */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
        <ConsultationChat
          consultationId={consultationId}
          doctorName={consultation.doctorName || "Doctor"}
          doctorSpecialization={consultation.doctorSpecialization}
          patientName={consultation.patientName || "Patient"}
          consultationStatus={consultation.status}
        />
      </div>

      {/* Prescription Modal (doctor only) */}
      <PrescriptionModal
        consultationId={consultationId}
        open={showPrescription}
        onOpenChange={setShowPrescription}
      />
    </div>
  );
}
