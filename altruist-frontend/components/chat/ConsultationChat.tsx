"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase, ChatMessage, MessageType, uploadChatFile } from "@/lib/supabase";
import ChatMessageBubble from "./ChatMessage";
import FileUpload from "./FileUpload";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Stethoscope,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Phone,
  Video,
  Info,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ConsultationChatProps {
  consultationId: string;
  doctorName: string;
  doctorSpecialization?: string;
  patientName: string;
  consultationStatus: string;
}

type PendingAttachment = {
  url: string;
  fileName: string;
  type: "image" | "file";
};

export default function ConsultationChat({
  consultationId,
  doctorName,
  doctorSpecialization,
  patientName,
  consultationStatus,
}: ConsultationChatProps) {
  const { user, userType } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [isPrescriptionMode, setIsPrescriptionMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDoctor = userType === "DOCTOR";
  const senderName = isDoctor ? doctorName : patientName;
  const senderRole: "doctor" | "patient" = isDoctor ? "doctor" : "patient";

  // ── Load Messages & Subscribe to Realtime securely ─────────────────────
  useEffect(() => {
    if (!consultationId || !user) return;
    
    let isMounted = true;
    let channel: any = null;

    const initChat = async () => {
      setLoading(true);
      try {
        // 1. Authenticate with Supabase via custom Backend JWT bridge
        const response = await api.get("/consultations/supabase-token");
        const token = response.data.token;
        
        await supabase.auth.setSession({
           access_token: token,
           refresh_token: ''
        });

        // 2. Fetch Chat History
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("consultation_id", consultationId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Failed to fetch messages:", error.message);
          toast.error("Could not load chat history");
        } else if (isMounted) {
          setMessages(data as ChatMessage[]);
        }

        // 3. Mount Realtime Subscription
        channel = supabase
          .channel(`chat:${consultationId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "chat_messages",
              filter: `consultation_id=eq.${consultationId}`,
            },
            (payload) => {
              const newMsg = payload.new as ChatMessage;
              if (isMounted) {
                setMessages((prev) => {
                  if (prev.find((m) => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });
              }
            }
          )
          .subscribe();

      } catch (err: any) {
         console.error("Failed to securely init chat:", err.message);
         toast.error("An error occurred while securing the chat channel");
      } finally {
         if (isMounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [consultationId, user]);

  // ── Auto-scroll on new messages ─────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingAttachment) return;
    if (!user) {
      toast.error("Please log in to send messages");
      return;
    }

    setSending(true);
    try {
      let messageType: MessageType = "text";
      let fileUrl: string | null = null;
      let fileName: string | null = null;

      if (pendingAttachment) {
        messageType = pendingAttachment.type;
        fileUrl = pendingAttachment.url;
        fileName = pendingAttachment.fileName;
      }

      if (isPrescriptionMode) {
        messageType = "prescription";
      }

      const payload = {
        consultation_id: consultationId,
        sender_id: user.uid,
        sender_role: senderRole,
        sender_name: senderName,
        message_type: messageType,
        content: trimmed || null,
        file_url: fileUrl,
        file_name: fileName,
        is_read: false,
      };

      const { error } = await supabase.from("chat_messages").insert(payload);
      if (error) throw new Error(error.message);

      setText("");
      setPendingAttachment(null);
      setIsPrescriptionMode(false);
      textareaRef.current?.focus();
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }, [text, pendingAttachment, user, consultationId, senderRole, senderName, isPrescriptionMode]);

  // ── Keyboard shortcut: Enter to send, Shift+Enter for newline ──────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUploaded = (url: string, fileName: string, type: "image" | "file") => {
    setPendingAttachment({ url, fileName, type });
    textareaRef.current?.focus();
  };

  const isClosed = consultationStatus === "COMPLETED" || consultationStatus === "CANCELLED";

  // ── Status badge config ─────────────────────────────────────────────────
  const statusBadge: Record<string, { label: string; className: string }> = {
    PENDING:   { label: "Waiting", className: "bg-amber-100 text-amber-800" },
    ONGOING:   { label: "Active", className: "bg-green-100 text-green-800" },
    COMPLETED: { label: "Completed", className: "bg-blue-100 text-blue-800" },
    CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
  };
  const status = statusBadge[consultationStatus] || statusBadge.PENDING;

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5]" style={{ minHeight: "calc(100vh - 80px)" }}>

      {/* ── Chat Header ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#059669] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {doctorName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm truncate">Dr. {doctorName}</h3>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                status.className
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="text-xs text-gray-500">{doctorSpecialization || "Specialist"} • Secure Consultation</p>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-[#E6F7F5] text-[#0D9488] px-2.5 py-1 rounded-full">
            <ShieldCheck size={12} />
            <span className="text-[11px] font-bold hidden sm:inline">Encrypted</span>
          </div>
        </div>
      </div>

      {/* ── Info bar (shown when consultation is closed) ────────────────── */}
      {isClosed && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2">
          <Info size={14} className="text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700 font-medium">
            This consultation has ended. You can review the conversation below.
          </p>
        </div>
      )}

      {/* ── Messages area ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Loader2 size={28} className="animate-spin text-[#0D9488]" />
            <p className="text-sm text-gray-400 font-medium">Loading messages…</p>
          </div>
        ) : messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-[#0D9488]/10 rounded-full flex items-center justify-center">
              <Stethoscope size={28} className="text-[#0D9488]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-700 text-sm">Start the Consultation</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                {isDoctor
                  ? "Send a greeting or ask the patient about their chief complaint."
                  : "Describe your symptoms to Dr. " + doctorName + " to get started."}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === user?.uid}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Pending attachment preview ──────────────────────────────────── */}
      {pendingAttachment && (
        <div className="mx-4 mb-2 px-3 py-2 bg-white rounded-xl border border-[#0D9488]/30 flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 bg-[#0D9488]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Stethoscope size={14} className="text-[#0D9488]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{pendingAttachment.fileName}</p>
            <p className="text-[11px] text-[#0D9488]">Ready to send • add a caption below</p>
          </div>
          <button
            className="text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => setPendingAttachment(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Prescription mode toggle (doctor only) ──────────────────────── */}
      {isDoctor && !isClosed && (
        <div className="px-4 pb-1">
          <button
            onClick={() => setIsPrescriptionMode((p) => !p)}
            className={cn(
              "text-[11px] font-bold px-3 py-1 rounded-full transition-all",
              isPrescriptionMode
                ? "bg-[#0D9488] text-white"
                : "bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20"
            )}
          >
            <Stethoscope size={10} className="inline mr-1" />
            {isPrescriptionMode ? "✓ Prescription Mode ON" : "Send as Prescription Note"}
          </button>
        </div>
      )}

      {/* ── Input box ───────────────────────────────────────────────────── */}
      {isClosed ? (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <p className="text-center text-xs text-gray-400 font-medium">
            This consultation is {consultationStatus.toLowerCase()}. Messaging is disabled.
          </p>
        </div>
      ) : (
        <div className="bg-white border-t border-gray-100 px-3 py-3">
          <div className="flex items-end gap-2">
            {/* File upload buttons */}
            <FileUpload
              consultationId={consultationId}
              onFileUploaded={handleFileUploaded}
              disabled={sending}
            />

            {/* Text input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isPrescriptionMode
                    ? "Write prescription notes, dosage, and instructions…"
                    : "Type a message… (Enter to send, Shift+Enter for new line)"
                }
                className={cn(
                  "min-h-[44px] max-h-[140px] resize-none rounded-2xl border text-sm py-2.5 pr-12 transition-all",
                  isPrescriptionMode
                    ? "border-[#0D9488] bg-[#E6F7F5] focus-visible:ring-[#0D9488]"
                    : "border-gray-200 focus-visible:ring-[#0D9488]"
                )}
                rows={1}
                disabled={sending}
              />
            </div>

            {/* Send button */}
            <Button
              onClick={sendMessage}
              disabled={sending || (!text.trim() && !pendingAttachment)}
              className="h-11 w-11 p-0 rounded-full bg-[#0D9488] hover:bg-[#0b7a6e] shadow-lg shadow-[#0D9488]/25 flex-shrink-0 transition-all active:scale-95 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
