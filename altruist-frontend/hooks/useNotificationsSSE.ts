"use client";
import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";

export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const FLAG = process.env.NEXT_PUBLIC_SSE_NOTIFICATIONS === "true";
const API = process.env.NEXT_PUBLIC_API_URL || "";

export function useNotificationsSSE(
  onEvent?: (n: NotificationDTO) => void,
  onUnread?: (count: number) => void
) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<NotificationDTO | null>(null);
  const retryRef = useRef(0);
  const esRef = useRef<EventSource | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!FLAG) return;
    cancelledRef.current = false;

    const connect = async () => {
      try {
        const user = auth?.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const ticketRes = await fetch(`${API}/notifications/stream-ticket`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!ticketRes.ok) throw new Error(`ticket-${ticketRes.status}`);
        const { ticket } = await ticketRes.json();
        if (cancelledRef.current || !ticket) return;

        const es = new EventSource(`${API}/notifications/stream?ticket=${encodeURIComponent(ticket)}`);
        esRef.current = es;
        es.addEventListener("open", () => { retryRef.current = 0; setConnected(true); });
        es.addEventListener("notification", (e: MessageEvent) => {
          try {
            const n: NotificationDTO = JSON.parse(e.data);
            setLastEvent(n);
            onEvent?.(n);
          } catch { /* ignore malformed */ }
        });
        es.addEventListener("unread", (e: MessageEvent) => {
          const c = Number((e as any).data) || 0;
          onUnread?.(c);
        });
        es.onerror = () => {
          setConnected(false);
          es.close();
          if (retryRef.current++ < 3 && !cancelledRef.current) setTimeout(connect, 5000);
        };
      } catch {
        if (retryRef.current++ < 3 && !cancelledRef.current) setTimeout(connect, 5000);
      }
    };
    connect();
    return () => {
      cancelledRef.current = true;
      esRef.current?.close();
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { connected, lastEvent };
}