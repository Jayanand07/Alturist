"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, ShoppingCart } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrderItem = {
  name?: string;
  quantity?: number;
  price?: number;
  discountedPrice?: number;
};

type Order = {
  id: string;
  items: string;
  totalAmount: number;
  deliveryAddress: string;
  status: "PENDING" | "CONFIRMED" | "DELIVERED";
  createdAt: string;
};

type OrdersResponse = {
  content?: Order[];
};

const statusStyles: Record<Order["status"], string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  DELIVERED: "border-teal-200 bg-teal-50 text-teal-700",
};

function parseItems(items: string): OrderItem[] {
  try {
    const parsed = JSON.parse(items);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, router, user]);

  React.useEffect(() => {
    if (authLoading || !user) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .get<OrdersResponse>("/orders/my?size=20&sort=createdAt,desc")
      .then((response) => {
        if (!isMounted) return;
        setOrders(response.data.content ?? []);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load your orders right now.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, user]);

  if (authLoading || !user) return null;

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/patient" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-700">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">My Orders</h1>
            <p className="mt-2 text-sm text-slate-500">Track medicine orders placed from your Altruist account.</p>
          </div>
          <Link href="/medicines">
            <Button className="bg-teal-600 font-bold text-white hover:bg-teal-700">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Order Medicines
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        )}

        {!loading && error && (
          <Card className="border-red-100 bg-red-50">
            <CardContent className="p-6 text-sm font-semibold text-red-700">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && orders.length === 0 && (
          <Card className="border-slate-200 bg-white">
            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50">
                <Package className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-950">No orders yet</h2>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Medicines you order from Altruist will appear here with their latest status.
              </p>
              <Link href="/medicines" className="mt-6">
                <Button className="bg-teal-600 font-bold text-white hover:bg-teal-700">Browse Medicines</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const items = parseItems(order.items);
              return (
                <Card key={order.id} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-950">Order #{order.id.slice(0, 8)}</CardTitle>
                      <p className="mt-1 text-xs font-medium text-slate-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge className={`self-start border px-3 py-1 text-xs font-bold sm:self-auto ${statusStyles[order.status]}`}>
                      {order.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-5 p-5">
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={`${order.id}-${index}`} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.name ?? "Medicine"}</p>
                            <p className="text-xs text-slate-500">Quantity: {item.quantity ?? 1}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-700">
                            ₹{Number(item.discountedPrice ?? item.price ?? 0).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-[1fr_auto] md:items-end">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Delivery address</p>
                        <p className="mt-1 text-sm text-slate-600">{order.deliveryAddress}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total</p>
                        <p className="mt-1 text-2xl font-extrabold text-teal-700">₹{Number(order.totalAmount).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
