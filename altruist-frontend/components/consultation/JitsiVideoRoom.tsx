"use client";

import React, { useEffect, useState, useRef } from "react";
import { Phone, Shield, Clock, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JitsiVideoRoomProps {
  roomName: string;
  displayName: string;
  userRole: "doctor" | "patient";
  jitsiDomain?: string;
  onCallEnd: () => void;
}

export default function JitsiVideoRoom({
  roomName,
  displayName,
  userRole,
  jitsiDomain = "meet.jit.si",
  onCallEnd,
}: JitsiVideoRoomProps) {
  const [seconds, setSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Build Jitsi iframe URL
  const jitsiUrl = `https://${jitsiDomain}/${roomName}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Top Overlay Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-none">Altruist</p>
              <p className="text-white/50 text-[10px] font-medium mt-0.5">
                {userRole === "doctor" ? "Doctor Console" : "Consultation in Progress"}
              </p>
            </div>
          </div>

          {/* Center: Timer + Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <Clock size={14} className="text-green-400" />
              <span className="text-white font-mono font-bold text-sm tracking-wider">
                {formatTime(seconds)}
              </span>
              <span className="hidden sm:inline h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <button
              onClick={toggleFullscreen}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
          </div>

          {/* Right: End Call */}
          <Button
            onClick={onCallEnd}
            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-6 h-10 shadow-lg shadow-red-600/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <Phone size={16} className="rotate-[135deg]" />
            <span className="hidden sm:inline">End Consultation</span>
            <span className="sm:hidden">End</span>
          </Button>
        </div>
      </div>

      {/* Jitsi iframe */}
      <iframe
        src={jitsiUrl}
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        title="Video Consultation"
      />
    </div>
  );
}
