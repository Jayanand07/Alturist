"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  MessageSquare, Send, Loader2, LifeBuoy, Clock, CheckCircle, 
  AlertCircle, ChevronRight, ArrowLeft, MoreVertical, Circle
} from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSupportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, userType, loading: authLoading } = useAuth();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
    } else if (!authLoading && userType && userType !== "ADMIN" && userType !== "SUPER_ADMIN" && userType !== "DOCTOR") {
      router.push("/");
    }
  }, [authUser, userType, authLoading, router]);

  // Fetch Tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["admin-support-tickets", filterStatus],
    queryFn: async () => {
      const endpoint = filterStatus === "ALL" 
        ? "/admin/support/tickets" 
        : `/admin/support/tickets?status=${filterStatus}`;
      return (await api.get(endpoint)).data;
    },
    enabled: !!authUser && (userType === "ADMIN" || userType === "SUPER_ADMIN" || userType === "DOCTOR"),
  });

  // Fetch Messages for selected ticket (polls every 15s)
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["support-messages", selectedTicketId],
    queryFn: async () => (await api.get(`/support/tickets/${selectedTicketId}/messages`)).data,
    enabled: !!selectedTicketId,
    refetchInterval: 15000,
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      await api.post(`/support/tickets/${selectedTicketId}/messages`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-messages", selectedTicketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      setMessageInput("");
    },
    onError: () => toast.error("Failed to send message")
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.patch(`/admin/support/tickets/${selectedTicketId}/status`, { status });
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      toast.success(`Ticket marked as ${status}`);
    },
    onError: () => toast.error("Failed to update status")
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge className="bg-blue-100 text-blue-700 border-none font-bold">Open</Badge>;
      case 'IN_PROGRESS': return <Badge className="bg-amber-100 text-amber-700 border-none font-bold">In Progress</Badge>;
      case 'RESOLVED': return <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">Resolved</Badge>;
      case 'CLOSED': return <Badge className="bg-slate-100 text-slate-700 border-none font-bold">Closed</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-700 border-none font-bold">{status}</Badge>;
    }
  };

  const selectedTicket = useMemo(() => {
    return tickets?.find((t: any) => t.id === selectedTicketId);
  }, [tickets, selectedTicketId]);

  if (authLoading) {
    return <div className="min-h-[500px] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
            <LifeBuoy size={24} />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Support Tickets</h1>
            <p className="text-slate-500 font-medium text-sm">Manage and respond to patient inquiries.</p>
          </div>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex-1 bg-surface border border-slate-200 shadow-sm rounded-3xl overflow-hidden flex relative min-h-0">
        
        {/* Left Panel: Ticket List */}
        <div className={cn(
          "w-full md:w-80 lg:w-[400px] flex-shrink-0 flex flex-col border-r border-slate-100 transition-transform bg-surface z-10",
          showMobileChat ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
              <TabsList className="grid grid-cols-5 w-full bg-slate-200/50 p-1">
                <TabsTrigger value="ALL" className="text-[10px] sm:text-xs">All</TabsTrigger>
                <TabsTrigger value="OPEN" className="text-[10px] sm:text-xs">Open</TabsTrigger>
                <TabsTrigger value="IN_PROGRESS" className="text-[10px] sm:text-xs">Active</TabsTrigger>
                <TabsTrigger value="RESOLVED" className="text-[10px] sm:text-xs">Res</TabsTrigger>
                <TabsTrigger value="CLOSED" className="text-[10px] sm:text-xs">Closed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {ticketsLoading ? (
              <div className="p-6 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
            ) : !tickets || tickets.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center justify-center h-full opacity-60">
                <MessageSquare size={32} className="text-slate-400 mb-3" />
                <p className="font-bold text-slate-600 mb-1">No tickets found</p>
                <p className="text-xs text-slate-500 font-medium">Clear filters to see more.</p>
              </div>
            ) : (
              tickets.map((ticket: any) => (
                <div 
                  key={ticket.id}
                  onClick={() => { setSelectedTicketId(ticket.id); setShowMobileChat(true); }}
                  className={cn(
                    "p-4 rounded-2xl cursor-pointer transition-all border relative",
                    selectedTicketId === ticket.id 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-surface border-transparent hover:bg-slate-50"
                  )}
                >
                  {ticket.unreadCount > 0 && (
                     <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-sm" />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={cn(
                      "font-bold text-sm line-clamp-1 pr-6",
                      selectedTicketId === ticket.id ? "text-primary" : "text-slate-900",
                      ticket.unreadCount > 0 && "font-black"
                    )}>
                      {ticket.subject}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-5 h-5">
                       <AvatarFallback className="text-[9px] bg-slate-200 font-bold">{ticket.patientName?.charAt(0) || 'P'}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-bold text-slate-600">{ticket.patientName || "Unknown Patient"}</span>
                    <span className="text-[10px] text-slate-400 font-bold ml-auto">
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(ticket.createdAt))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                      {getStatusBadge(ticket.status)}
                      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">
                        {ticket.category}
                      </Badge>
                    </div>
                    <ChevronRight size={14} className={cn("transition-colors", selectedTicketId === ticket.id ? "text-primary" : "text-slate-300")} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col bg-surface-muted/30/50 absolute md:relative inset-0 z-20 transition-transform",
          showMobileChat ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}>
          {selectedTicketId ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-slate-200 bg-surface px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Button variant="ghost" size="icon" className="md:hidden shrink-0 -ml-2" onClick={() => setShowMobileChat(false)}>
                    <ArrowLeft size={20} className="text-slate-600" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate pr-4">{selectedTicket?.subject}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold mt-0.5">
                      <span className="text-slate-500">Patient: {selectedTicket?.patientName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">ID: {selectedTicket?.id?.split('-')[0]}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Select 
                    value={selectedTicket?.status} 
                    onValueChange={(val) => updateStatusMutation.mutate(val)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="h-9 w-[130px] font-bold text-xs bg-surface border-slate-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {selectedTicket?.status !== 'CLOSED' && (
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="font-bold text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                       onClick={() => updateStatusMutation.mutate('CLOSED')}
                       disabled={updateStatusMutation.isPending}
                     >
                       Close Ticket
                     </Button>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" ref={chatScrollRef}>
                {messagesLoading ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-start"><div className="bg-primary/20 animate-pulse h-10 w-48 rounded-2xl rounded-tl-sm" /></div>
                    <div className="flex flex-col items-end"><div className="bg-slate-200 animate-pulse h-16 w-64 rounded-2xl rounded-tr-sm" /></div>
                  </div>
                ) : !messages || messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-400 font-medium">No messages yet.</p>
                  </div>
                ) : (
                  messages.map((msg: any, idx: number) => {
                    const isAdmin = msg.senderRole === "ADMIN" || msg.senderRole === "SUPER_ADMIN";
                    return (
                      <div key={msg.id || idx} className={cn("flex flex-col max-w-[85%] md:max-w-[70%]", isAdmin ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className={cn(
                          "px-4 py-3 shadow-sm text-sm font-medium",
                          isAdmin 
                            ? "bg-slate-800 text-white rounded-2xl rounded-tr-sm" 
                            : "bg-primary text-white rounded-2xl rounded-tl-sm"
                        )}>
                          {msg.message}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 px-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            {msg.senderName} ({msg.senderRole}) • {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(msg.createdAt))}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              {selectedTicket?.status !== 'CLOSED' ? (
                <div className="p-4 bg-surface border-t border-slate-200 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                    <Textarea 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type your reply as Admin..."
                      className="min-h-[50px] max-h-[120px] resize-none rounded-2xl focus-visible:ring-slate-800 border-slate-300 py-3 bg-slate-50"
                    />
                    <Button 
                      type="submit" 
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      className="h-10 w-12 rounded-full shrink-0 bg-slate-800 hover:bg-slate-900 shadow-md transition-transform active:scale-95 text-white"
                    >
                      {sendMessageMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 border-t border-slate-200 text-center shrink-0">
                  <p className="text-sm font-bold text-slate-500 flex items-center justify-center gap-2">
                    <AlertCircle size={16} /> This ticket is closed. Reopen to reply.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 hidden md:flex">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6 text-slate-300">
                <MessageSquare size={40} />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Admin Support Panel</h3>
              <p className="text-slate-500 font-medium max-w-sm text-center">Select a ticket from the left to read and respond to patient inquiries.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
