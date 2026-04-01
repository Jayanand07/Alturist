"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Loader2,
  ShieldAlert,
  Video,
  Clock,
  Calendar,
  IndianRupee,
  User as UserIcon,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import JitsiVideoRoom from "@/components/consultation/JitsiVideoRoom";
import PrescriptionModal from "@/components/consultation/PrescriptionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface JitsiConfig {
  roomName: string;
  displayName: string;
  userRole: "doctor" | "patient";
  jitsiDomain: string;
  consultationStatus: string;
}

export default function ConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const consultationId = params.id as string;

  const [isInCall, setIsInCall] = useState(false);
  const [jitsiConfig, setJitsiConfig] = useState<JitsiConfig | null>(null);
  const [showPrescription, setShowPrescription] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);

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
    refetch,
  } = useQuery({
    queryKey: ["consultation", consultationId],
    queryFn: async () => {
      const res = await api.get(`/consultations/${consultationId}`);
      return res.data;
    },
    enabled: !!consultationId && !!user,
    retry: false,
    refetchInterval: isInCall ? false : 5000, // Poll every 5s when not in call
  });

  // Handle 403 — not authorized for this consultation
  useEffect(() => {
    if (isError && (error as any)?.response?.status === 403) {
      toast.error("You don't have access to this consultation");
      router.push("/");
    }
  }, [isError, error, router]);

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/consultations/${consultationId}/room/join`);
      return res.data as JitsiConfig;
    },
    onSuccess: (data) => {
      setJitsiConfig(data);
      setIsInCall(true);
      setCallStartTime(Date.now());
      toast.success("Connected to video room");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to join consultation";
      toast.error(message);
    },
  });

  const handleJoinCall = () => {
    joinRoomMutation.mutate();
  };

  const handleCallEnd = async () => {
    setIsInCall(false);

    // Calculate call duration
    const durationMinutes = callStartTime
      ? Math.ceil((Date.now() - callStartTime) / 60000)
      : 0;

    if (jitsiConfig?.userRole === "doctor") {
      // Doctor must fill in prescription before completing
      setShowPrescription(true);
    } else {
      // Patient redirect
      toast.success("Consultation ended. Thank you!");
      await refetch();
      router.push("/patient");
    }
  };

  // ── Loading & Error States ────────────────────────────────────────────

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-teal-100 animate-pulse" />
          <Loader2
            size={32}
            className="text-teal-500 animate-spin absolute inset-0 m-auto"
          />
        </div>
        <p className="text-gray-500 font-medium text-lg">
          Loading consultation...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <ShieldAlert size={48} className="text-red-400" />
        <p className="text-gray-500 font-medium text-lg">
          Unable to load consultation
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="mt-4"
        >
          Go Home
        </Button>
      </div>
    );
  }

  if (!consultation) return null;

  // ── Video Room ────────────────────────────────────────────────────────

  if (isInCall && jitsiConfig) {
    return (
      <>
        <JitsiVideoRoom
          roomName={jitsiConfig.roomName}
          displayName={jitsiConfig.displayName}
          userRole={jitsiConfig.userRole}
          jitsiDomain={jitsiConfig.jitsiDomain}
          onCallEnd={handleCallEnd}
        />
        <PrescriptionModal
          consultationId={consultationId}
          open={showPrescription}
          onOpenChange={setShowPrescription}
        />
      </>
    );
  }

  // ── Waiting Room UI ───────────────────────────────────────────────────

  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Waiting", color: "bg-yellow-100 text-yellow-800" },
    ONGOING: { label: "In Progress", color: "bg-green-100 text-green-800" },
    COMPLETED: { label: "Completed", color: "bg-blue-100 text-blue-800" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  };

  const currentStatus = statusConfig[consultation.status] || statusConfig.PENDING;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Video Consultation
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            Secure, private consultation room
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Consultation Card */}
        <Card className="overflow-hidden border-none shadow-lg rounded-2xl">
          <CardContent className="p-0">
            {/* Doctor info header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
                  {consultation.doctorName?.charAt(0) || "D"}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Dr. {consultation.doctorName}
                  </h2>
                  <p className="text-teal-100 font-medium text-sm">
                    {consultation.doctorSpecialization}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold ${currentStatus.color}`}
                  >
                    {currentStatus.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Calendar size={18} className="text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Scheduled
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(consultation.scheduledAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Video size={18} className="text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Type
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {consultation.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <IndianRupee size={18} className="text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Fee
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    ₹{consultation.amount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <UserIcon size={18} className="text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Patient
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {consultation.patientName}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-6">
              {consultation.status === "COMPLETED" ? (
                <div className="text-center p-6 bg-blue-50 rounded-2xl space-y-3">
                  <Stethoscope size={32} className="text-blue-500 mx-auto" />
                  <p className="font-bold text-blue-900">
                    Consultation Completed
                  </p>
                  <p className="text-sm text-blue-600">
                    {consultation.diagnosis
                      ? "Prescription has been submitted."
                      : "This consultation has ended."}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/patient")}
                    className="mt-2"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              ) : consultation.status === "CANCELLED" ? (
                <div className="text-center p-6 bg-red-50 rounded-2xl">
                  <p className="font-bold text-red-900">
                    This consultation was cancelled.
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleJoinCall}
                  disabled={joinRoomMutation.isPending}
                  className="w-full bg-[#0D9488] hover:bg-[#0b7a6e] font-black h-14 rounded-2xl text-lg shadow-xl shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-60"
                >
                  {joinRoomMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Video size={20} />
                      Join Consultation
                    </span>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Waiting message */}
        {consultation.status === "PENDING" && !isInCall && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Clock size={16} />
              <p className="text-sm font-medium">
                Waiting for participants to join...
              </p>
            </div>
            <p className="text-xs text-gray-400">
              The consultation will begin when both parties are connected.
            </p>
          </div>
        )}
      </div>

      {/* Prescription Modal (for when doctor ends call outside of video view) */}
      <PrescriptionModal
        consultationId={consultationId}
        open={showPrescription}
        onOpenChange={setShowPrescription}
      />
    </div>
  );
}
