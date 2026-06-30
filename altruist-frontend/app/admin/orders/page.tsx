"use client";

import React, { useState } from "react";
import { 
  Package, Search, Eye, Loader2, AlertCircle, Calendar, 
  MapPin, DollarSign, ArrowLeft, ArrowRight, User, Pill, CreditCard, 
  RefreshCw, CheckCircle2, Truck, Check, XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// --- Types ---
type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  patientName: string;
  items: string; // JSON
  totalAmount: number;
  deliveryAddress: string;
  status: OrderStatus;
  prescriptionUrl?: string;
  paymentMethod: string;
  createdAt: string;
}

interface PaginatedResponse {
  content: Order[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// Status Badges Styling
const statusStyles: Record<OrderStatus, { border: string; bg: string; text: string; icon: any }> = {
  PENDING: {
    border: "border-amber-200",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-400",
    icon: RefreshCw
  },
  CONFIRMED: {
    border: "border-blue-200",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-700 dark:text-blue-400",
    icon: CheckCircle2
  },
  SHIPPED: {
    border: "border-indigo-200",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    text: "text-indigo-700 dark:text-indigo-400",
    icon: Truck
  },
  DELIVERED: {
    border: "border-emerald-200",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-[#0D9488] dark:text-[#14B8A6]",
    icon: Check
  },
  CANCELLED: {
    border: "border-rose-200",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    text: "text-rose-700 dark:text-rose-400",
    icon: XCircle
  }
};

// State Machine allowed transitions mapping
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: []
};

// Date Formatter
function formatDate(value: string | null | undefined): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  
  // Dialog State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch Orders Query
  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse>({
    queryKey: ["admin-orders", page, pageSize],
    queryFn: async () => {
      // Direct call to standard paginated GET endpoint
      const res = await api.get(`/admin/orders?page=${page}&size=${pageSize}`);
      return res.data;
    }
  });

  // Safe parse for items JSON
  const parseOrderItems = (itemsJson: string | null | undefined): OrderItem[] => {
    if (!itemsJson) return [];
    try {
      const parsed = JSON.parse(itemsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Status change handler calling the real PATCH endpoint
  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
      return res.data;
    },
    onSuccess: (data: Order) => {
      toast.success(`Order status updated successfully to ${data.status}`);
      // Invalidate queries to trigger a fresh refetch of the list
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      // If details dialog is showing this order, update the dialog state too
      if (selectedOrder && selectedOrder.id === data.id) {
        setSelectedOrder(data);
      }
    },
    onError: (err: any) => {
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message || "An unexpected error occurred.";
      if (status === 409) {
        toast.error("Fulfillment Conflict: This order was updated by another request. Reloading list...");
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      } else if (status === 400) {
        toast.error(`Invalid State Transition: ${message}`);
      } else {
        toast.error(`Fulfillment Error: ${message}`);
      }
    }
  });

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    updateStatus({ orderId, status: nextStatus });
  };

  // Filtering on UI level (search by Patient Name or Order ID)
  const filteredOrders = data?.content
    ?.filter(Boolean)
    ?.filter(order => {
      const searchLower = search.toLowerCase();
      const patientName = order?.patientName || "";
      const orderId = order?.id || "";
      return (
        patientName.toLowerCase().includes(searchLower) ||
        orderId.toLowerCase().includes(searchLower)
      );
    }) || [];

  return (
    <div className="space-y-6">
      {/* Top statistics or actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="text-teal-600 w-6 h-6" />
            Order Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View, track, and update fulfillment statuses for patient medicine orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-10 rounded-xl font-bold border-gray-200 text-gray-600 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Filter & Search Board */}
      <Card className="border-gray-200/80 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by Patient Name or Order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 border-gray-200 rounded-xl focus-visible:ring-teal-500 text-sm"
            />
          </div>
        </div>

        <CardContent className="p-0 bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-sm font-semibold text-gray-500">Loading orders...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 px-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <h3 className="text-lg font-bold text-gray-900">Failed to load orders</h3>
              <p className="text-sm text-gray-500 max-w-md">
                There was a problem communicating with the server. Please try refreshing or checking back later.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
              <p className="text-sm text-gray-500">No orders match your search parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/75 border-b border-gray-100">
                  <TableRow>
                    <TableHead className="font-bold text-gray-700 h-12 pl-6">Order ID</TableHead>
                    <TableHead className="font-bold text-gray-700 h-12">Patient</TableHead>
                    <TableHead className="font-bold text-gray-700 h-12">Medicines</TableHead>
                    <TableHead className="font-bold text-gray-700 h-12">Total Amount</TableHead>
                    <TableHead className="font-bold text-gray-700 h-12">Date Placed</TableHead>
                    <TableHead className="font-bold text-gray-700 h-12">Status</TableHead>
                    <TableHead className="font-bold text-gray-700 h-12 pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {filteredOrders.map((order) => {
                    const itemsList = parseOrderItems(order.items) || [];
                    const itemsSummary = itemsList
                      .filter(Boolean)
                      .map(it => `${it.name || "Unknown Medicine"} (x${it.quantity || 1})`)
                      .join(", ");
                    const statusConfig = (order.status && statusStyles[order.status]) || { border: "border-gray-200", bg: "bg-gray-50", text: "text-gray-700", icon: RefreshCw };
                    const StatusIcon = statusConfig.icon;

                    // Allowed next transitions based on status
                    const nextTransitions = (order.status && ALLOWED_TRANSITIONS[order.status]) || [];

                    return (
                      <TableRow key={order.id || Math.random().toString()} className="hover:bg-slate-50/50 transition-colors border-b border-gray-100">
                        <TableCell className="font-bold text-slate-900 pl-6 py-4">
                          <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {order.id ? order.id.slice(0, 8) : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900">{order.patientName || "Unknown Patient"}</TableCell>
                        <TableCell className="max-w-[280px]">
                          <p className="text-sm text-gray-600 truncate" title={itemsSummary}>
                            {itemsSummary || "No items"}
                          </p>
                        </TableCell>
                        <TableCell className="font-extrabold text-[#0D9488]">₹{Number(order.totalAmount || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-gray-500 text-sm">{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={cn("border px-2.5 py-1 text-xs font-bold bg-transparent shadow-none rounded-full flex items-center gap-1.5 w-fit", statusConfig.border, statusConfig.bg, statusConfig.text)}>
                            <StatusIcon className="w-3 h-3" />
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {/* View details */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-lg text-gray-500 hover:text-[#0D9488] hover:bg-teal-50"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </Button>

                            {/* Dropdown status actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger render={
                                <button 
                                  className="inline-flex items-center justify-center h-8 rounded-lg font-bold border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700 text-xs px-2.5 cursor-pointer focus:outline-none transition-colors disabled:pointer-events-none disabled:opacity-50"
                                  disabled={nextTransitions.length === 0}
                                >
                                  Update Status
                                </button>
                              } />
                              <DropdownMenuContent align="end" className="border-border shadow-md rounded-xl bg-background p-1 min-w-[150px]">
                                <div className="text-[10px] font-bold text-gray-400 uppercase px-2.5 py-1.5 select-none">Change Status To</div>
                                <DropdownMenuSeparator className="my-1 border-gray-100" />
                                {nextTransitions.map((nextStatus) => (
                                  <DropdownMenuItem 
                                    key={nextStatus}
                                    className="cursor-pointer font-semibold text-xs px-2.5 py-2 rounded-lg hover:bg-muted text-gray-700"
                                    onClick={() => handleStatusChange(order.id, nextStatus)}
                                  >
                                    {nextStatus}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Simple Pagination Board */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between p-5 bg-white border-t border-gray-100">
              <span className="text-sm font-medium text-gray-500">
                Showing page <span className="font-semibold text-gray-900">{page + 1}</span> of <span className="font-semibold text-gray-900">{data.totalPages}</span>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold border-gray-200 text-gray-600"
                  disabled={data.first}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold border-gray-200 text-gray-600"
                  disabled={data.last}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details View Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl border-gray-200 rounded-2xl overflow-hidden p-0 gap-0">
          {selectedOrder && (
            <>
              <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/50">
                <DialogTitle className="text-xl font-extrabold text-gray-900 flex items-center justify-between pr-6">
                  <span>Order Details</span>
                  <Badge className={cn("border px-2.5 py-1 text-xs font-bold bg-transparent shadow-none rounded-full flex items-center gap-1.5 w-fit", statusStyles[selectedOrder.status]?.border, statusStyles[selectedOrder.status]?.bg, statusStyles[selectedOrder.status]?.text)}>
                    {selectedOrder.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-1 font-semibold">
                  Order ID: {selectedOrder.id} • Placed on {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Patient & Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      Patient Info
                    </div>
                    <p className="text-sm font-bold text-gray-800">{selectedOrder.patientName || "Unknown Patient"}</p>
                    <p className="text-xs text-gray-500">Payment: <span className="font-bold text-gray-700">{selectedOrder.paymentMethod}</span></p>
                  </div>
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      Delivery Address
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                      {selectedOrder.deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-gray-400" />
                    Ordered Medicines
                  </h3>
                  <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {parseOrderItems(selectedOrder.items).filter(Boolean).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3.5 bg-white">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-gray-800">{item.name || "Unknown Medicine"}</p>
                          <p className="text-xs text-gray-400 font-semibold">{item.manufacturer || "Unknown Manufacturer"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-gray-800">
                            ₹{Number(item.discountedPrice ?? item.price ?? 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400 font-semibold">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prescription Check if any */}
                {selectedOrder.prescriptionUrl && (
                  <div className="bg-teal-50/30 border border-teal-100 p-4 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-teal-800 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-teal-600" />
                        Prescription Attached
                      </p>
                      <p className="text-xs text-teal-600">A doctor prescription was uploaded with this order.</p>
                    </div>
                    <a 
                      href={selectedOrder.prescriptionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-black text-teal-600 hover:text-teal-700 bg-teal-100/50 hover:bg-teal-100 px-3.5 py-2 rounded-xl transition-all"
                    >
                      View Document
                    </a>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-500 uppercase">Total Amount</p>
                  <p className="text-2xl font-black text-[#0D9488]">₹{Number(selectedOrder.totalAmount).toFixed(2)}</p>
                </div>
              </div>

              <DialogFooter className="p-5 border-t border-gray-100 bg-gray-50/50 flex sm:justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-100">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-4xl mx-auto bg-rose-50 border border-rose-200 rounded-2xl my-10 space-y-4 shadow-sm">
          <h2 className="text-xl font-black text-rose-800 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-rose-600 animate-pulse" />
            Order Management Rendering Crash
          </h2>
          <p className="text-sm font-bold text-rose-700">
            Error Message: <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono text-rose-900">{this.state.error?.message}</code>
          </p>
          <div className="space-y-1">
            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Stack Trace</p>
            <pre className="p-4 bg-rose-950 text-rose-100 rounded-xl overflow-auto text-[10px] leading-relaxed font-mono max-h-72">
              {this.state.error?.stack}
            </pre>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => this.setState({ hasError: false, error: null })} 
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
            >
              Reset Page State
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 border border-rose-200 hover:bg-rose-100/50 text-rose-700 rounded-xl text-xs font-black transition-all cursor-pointer"
            >
              Force Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SafeAdminOrdersPage() {
  return (
    <ErrorBoundary>
      <AdminOrdersPage />
    </ErrorBoundary>
  );
}
