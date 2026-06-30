"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Calendar, MessageSquare, Globe, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { useNotificationsSSE, NotificationDTO } from "@/hooks/useNotificationsSSE";

export default function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<NotificationDTO[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await api.get("/notifications");
        return res.data;
      } catch {
        return [];
      }
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: async () => {
      await api.post("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read", { id: "read-all" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification dismissed", { id: "notification-dismiss" });
    },
  });

  // SSE live updates — optimistically prepend new notifications to the cache.
  useNotificationsSSE(
    (n) => {
      queryClient.setQueryData<NotificationDTO[]>(["notifications"], (old = []) => [n, ...old]);
    },
    (_count) => {
      // optional: backend may push unread-count deltas; kept as a hook for later.
    }
  );

  const iconFor = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case "CHAT":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "SYSTEM":
        return <Globe className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative hover:bg-primary/10 transition-colors h-11 w-11 rounded-full group shrink-0"
        >
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background animate-pulse" />
          )}
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-80 p-2 mt-2 rounded-2xl border-border shadow-xl bg-background max-h-[480px] overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-primary" /> Notifications
              {unreadCount > 0 && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold text-[10px] py-0 px-2 rounded-full">
                  {unreadCount} new
                </Badge>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  readAllMutation.mutate();
                }}
                className="text-[10px] font-black uppercase text-primary tracking-wider hover:underline"
                disabled={readAllMutation.isPending}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="py-1 space-y-1 mt-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="font-bold text-xs text-foreground mt-2">All caught up!</p>
                <p className="text-[10px] text-muted-foreground max-w-xs">You have no active notifications at the moment.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && readMutation.mutate(n.id)}
                  className={cn(
                    "p-3 rounded-xl transition-all cursor-pointer relative group/item flex gap-3 text-left border border-transparent",
                    n.isRead
                      ? "hover:bg-muted/30"
                      : "bg-primary/5 hover:bg-primary/10 border-primary/5 shadow-inner"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                    {iconFor(n.type)}
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0 pr-4">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-xs leading-none truncate", n.isRead ? "font-bold text-foreground/80" : "font-extrabold text-foreground")}>
                        {n.title}
                      </p>
                      <span className="text-[9px] text-muted-foreground/60 font-semibold shrink-0">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: false })}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium leading-normal line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(n.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100"
                    title="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}