"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  MessageSquare, Send, Plus, Loader2, LifeBuoy, Clock, CheckCircle, 
  AlertCircle, ChevronRight, X, ArrowLeft
} from "lucide-react";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

export default function PatientSupportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, userType, loading: authLoading } = useAuth();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const [newTicketForm, setNewTicketForm] = useState({
    subject: "",
    category: "Consultation",
    priority: "Medium",
    firstMessage: ""
  });

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
    } else if (!authLoading && userType !== "PATIENT") {
      router.push("/");
    }
  }, [authUser, userType, authLoading, router]);

  // Fetch Tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => (await api.get("/support/tickets")).data,
    enabled: !!authUser && userType === "PATIENT",
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

  // Create Ticket Mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof newTicketForm) => {
      return (await api.post("/support/tickets", data)).data;
    },
    onSuccess: (newTicket) => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Support ticket created successfully");
      setIsNewTicketOpen(false);
      setNewTicketForm({ subject: "", category: "Consultation", priority: "Medium", firstMessage: "" });
      setSelectedTicketId(newTicket.id);
      setShowMobileChat(true);
    },
    onError: () => toast.error("Failed to create ticket")
  });

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      await api.post(`/support/tickets/${selectedTicketId}/messages`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-messages", selectedTicketId] });
      setMessageInput("");
    },
    onError: () => toast.error("Failed to send message")
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject || !newTicketForm.firstMessage) {
      toast.error("Subject and message are required");
      return;
    }
    createTicketMutation.mutate(newTicketForm);
  };

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

  const selectedTicket = tickets?.find((t: any) => t.id === selectedTicketId);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100vh-80px)]">
        
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
            <LifeBuoy size={24} />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Help & Support</h1>
            <p className="text-slate-500 font-medium text-sm">Chat with our care team to resolve issues.</p>
          </div>
        </div>

        {/* Two-Panel Layout */}
        <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden flex relative">
          
          {/* Left Panel: Ticket List */}
          <div className={cn(
            "w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-slate-100 transition-transform bg-white z-10",
            showMobileChat ? "hidden md:flex" : "flex"
          )}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-900">Your Tickets</h2>
              <Button onClick={() => setIsNewTicketOpen(true)} size="sm" className="bg-primary hover:bg-primary/90 font-bold rounded-lg shadow-sm">
                <Plus size={16} className="mr-1" /> New
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {ticketsLoading ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
              ) : !tickets || tickets.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full opacity-60">
                  <MessageSquare size={32} className="text-slate-400 mb-3" />
                  <p className="font-bold text-slate-600 mb-1">No support tickets</p>
                  <p className="text-xs text-slate-500 font-medium">Tap 'New' to get help.</p>
                </div>
              ) : (
                tickets.map((ticket: any) => (
                  <div 
                    key={ticket.id}
                    onClick={() => { setSelectedTicketId(ticket.id); setShowMobileChat(true); }}
                    className={cn(
                      "p-4 rounded-2xl cursor-pointer transition-all border",
                      selectedTicketId === ticket.id 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-white border-transparent hover:bg-slate-50"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={cn(
                        "font-bold text-sm line-clamp-1 pr-2",
                        selectedTicketId === ticket.id ? "text-primary" : "text-slate-900"
                      )}>
                        {ticket.subject}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap mt-0.5">
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(ticket.createdAt))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
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
                <div className="h-16 border-b border-slate-200 bg-white px-4 flex items-center gap-3 shrink-0 shadow-sm z-10">
                  <Button variant="ghost" size="icon" className="md:hidden shrink-0 -ml-2" onClick={() => setShowMobileChat(false)}>
                    <ArrowLeft size={20} className="text-slate-600" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate pr-4">{selectedTicket?.subject}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold mt-0.5">
                      <span className="text-slate-500">Ticket #{selectedTicket?.id?.split('-')[0]}</span>
                      <span className="text-slate-300">•</span>
                      {getStatusBadge(selectedTicket?.status || 'OPEN')}
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" ref={chatScrollRef}>
                  {messagesLoading ? (
                    <div className="space-y-6">
                      <div className="flex flex-col items-start"><div className="bg-slate-200 animate-pulse h-12 w-48 rounded-2xl rounded-tl-sm" /></div>
                      <div className="flex flex-col items-end"><div className="bg-primary/20 animate-pulse h-16 w-64 rounded-2xl rounded-tr-sm" /></div>
                    </div>
                  ) : !messages || messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-400 font-medium">No messages yet.</p>
                    </div>
                  ) : (
                    messages.map((msg: any, idx: number) => {
                      const isPatient = msg.senderRole === "PATIENT";
                      return (
                        <div key={msg.id || idx} className={cn("flex flex-col max-w-[85%] md:max-w-[70%]", isPatient ? "ml-auto items-end" : "mr-auto items-start")}>
                          <div className={cn(
                            "px-4 py-3 shadow-sm text-sm font-medium",
                            isPatient 
                              ? "bg-primary text-white rounded-2xl rounded-tr-sm" 
                              : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm"
                          )}>
                            {msg.message}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5 px-1">
                            <span className="text-[10px] font-bold text-slate-400">
                              {msg.senderName} • {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(msg.createdAt))}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Area */}
                {selectedTicket?.status !== 'CLOSED' && selectedTicket?.status !== 'RESOLVED' ? (
                  <div className="p-4 bg-white border-t border-slate-200 shrink-0">
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
                        placeholder="Type your message..."
                        className="min-h-[50px] max-h-[120px] resize-none rounded-2xl focus-visible:ring-primary border-slate-300 py-3 bg-slate-50"
                      />
                      <Button 
                        type="submit" 
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        className="h-12 w-12 rounded-full shrink-0 bg-primary hover:bg-primary/90 shadow-md transition-transform active:scale-95"
                      >
                        {sendMessageMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-100 border-t border-slate-200 text-center shrink-0">
                    <p className="text-sm font-bold text-slate-500 flex items-center justify-center gap-2">
                      <AlertCircle size={16} /> This ticket is closed and cannot receive new messages.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 hidden md:flex">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6 text-primary">
                  <LifeBuoy size={40} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">How can we help?</h3>
                <p className="text-slate-500 font-medium max-w-sm text-center">Select a ticket from the sidebar to view your conversation or create a new one to get support.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl font-bold text-slate-900">Create Support Ticket</DialogTitle>
              <DialogDescription className="font-medium text-slate-500 mt-1">Our care team usually responds within 2 hours.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Subject</Label>
              <Input 
                required
                value={newTicketForm.subject} 
                onChange={e => setNewTicketForm({...newTicketForm, subject: e.target.value})} 
                placeholder="Briefly summarize your issue"
                className="h-11 rounded-xl focus-visible:ring-primary border-slate-300 font-medium"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Category</Label>
                <Select value={newTicketForm.category} onValueChange={v => setNewTicketForm({...newTicketForm, category: v || 'Other'})}>
                  <SelectTrigger className="h-11 rounded-xl focus:ring-primary border-slate-300 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    {["Consultation", "Billing", "Technical", "Medicine", "Other"].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Priority</Label>
                <Select value={newTicketForm.priority} onValueChange={v => setNewTicketForm({...newTicketForm, priority: v || 'LOW'})}>
                  <SelectTrigger className="h-11 rounded-xl focus:ring-primary border-slate-300 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    {["Low", "Medium", "High"].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Describe your issue</Label>
              <Textarea 
                required
                value={newTicketForm.firstMessage} 
                onChange={e => setNewTicketForm({...newTicketForm, firstMessage: e.target.value})} 
                placeholder="Please provide as much detail as possible..."
                className="min-h-[120px] rounded-xl focus-visible:ring-primary border-slate-300 resize-none py-3 font-medium"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsNewTicketOpen(false)} className="rounded-xl font-bold text-slate-600 hover:bg-slate-100">
                Cancel
              </Button>
              <Button type="submit" disabled={createTicketMutation.isPending} className="rounded-xl font-bold px-6 bg-primary hover:bg-primary/90 shadow-md transition-transform active:scale-95">
                {createTicketMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit Ticket
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
