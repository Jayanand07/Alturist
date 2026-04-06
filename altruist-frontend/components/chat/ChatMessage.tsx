"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { FileText, ImageIcon, Stethoscope, Download } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ChatMessageBubble({ message, isOwn }: ChatMessageProps) {
  const isPrescription = message.message_type === "prescription";
  const isImage = message.message_type === "image";
  const isFile = message.message_type === "file";

  return (
    <div className={cn("flex gap-3 max-w-[85%]", isOwn ? "ml-auto flex-row-reverse" : "mr-auto")}>
      {/* Avatar */}
      {!isOwn && (
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 self-end",
          message.sender_role === "doctor" ? "bg-[#0D9488]" : "bg-[#6366F1]"
        )}>
          {message.sender_name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        {/* Sender name (only for other person) */}
        {!isOwn && (
          <span className="text-[11px] font-semibold text-gray-500 px-1">
            {message.sender_role === "doctor" ? `Dr. ${message.sender_name}` : message.sender_name}
          </span>
        )}

        {/* Bubble */}
        {isPrescription ? (
          /* Prescription bubble — special styling */
          <div className={cn(
            "rounded-2xl px-4 py-3 max-w-sm border-2 border-[#0D9488]/30 bg-gradient-to-br from-[#E6F7F5] to-[#F0FDF9]",
            isOwn ? "rounded-tr-sm" : "rounded-tl-sm"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#0D9488] rounded-full flex items-center justify-center">
                <Stethoscope size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Prescription Note</p>
              </div>
            </div>
            <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </div>
        ) : isImage && message.file_url ? (
          /* Image bubble */
          <div className={cn(
            "rounded-2xl overflow-hidden shadow-sm border border-gray-100",
            isOwn ? "rounded-tr-sm" : "rounded-tl-sm"
          )}>
            <a href={message.file_url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.file_url}
                alt={message.file_name || "Image"}
                className="max-w-[280px] max-h-[300px] object-cover hover:opacity-95 transition-opacity cursor-pointer"
              />
            </a>
            {message.content && (
              <div className={cn("px-3 py-2 text-sm", isOwn ? "bg-[#0D9488] text-white" : "bg-white text-gray-800")}>
                {message.content}
              </div>
            )}
          </div>
        ) : isFile && message.file_url ? (
          /* File bubble */
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-sm border",
            isOwn
              ? "bg-[#0D9488] text-white border-[#0D9488] rounded-tr-sm"
              : "bg-white text-gray-800 border-gray-100 rounded-tl-sm"
          )}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", isOwn ? "bg-white/20" : "bg-[#0D9488]/10")}>
              <FileText size={18} className={isOwn ? "text-white" : "text-[#0D9488]"} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate max-w-[180px]">{message.file_name || "File"}</p>
              <p className={cn("text-xs", isOwn ? "text-white/70" : "text-gray-400")}>Attachment</p>
            </div>
            <a href={message.file_url} target="_blank" rel="noopener noreferrer" download>
              <Download size={16} className={isOwn ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-gray-700"} />
            </a>
          </div>
        ) : (
          /* Text bubble */
          <div className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
            isOwn
              ? "bg-[#0D9488] text-white rounded-tr-sm"
              : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
          )}>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 px-1">{formatTime(message.created_at)}</span>
      </div>
    </div>
  );
}
