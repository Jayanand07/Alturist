"use client"

import React from "react"
import Link from "next/link"
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft,
  ShieldCheck, AlertCircle, Upload, Pill, Tag, Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/store/cartStore"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const DELIVERY_FEE    = 0
const FREE_THRESHOLD  = 500

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore()

  const subtotal              = getTotalPrice()
  const delivery              = subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE
  const total                 = subtotal + delivery
  const hasPrescriptionItems  = items.some(i => i.requiresPrescription)
  const cartCount             = getTotalItems()

  const handleUploadRx = () => toast.info("Prescription upload coming soon!", { icon: "📎" })

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center page-enter">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#E6F7F3] to-[#D1FAE5] flex items-center justify-center mb-6 shadow-lg shadow-[#00A87E]/10">
          <ShoppingCart className="h-14 w-14 text-primary/40" />
        </div>
        <h2 className="font-heading text-3xl font-extrabold text-foreground mb-3">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 max-w-sm font-medium">
          You haven't added any medicines yet. Explore our catalogue to find what you need.
        </p>
        <Link href="/medicines">
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-10 py-6 text-base rounded-2xl shadow-xl shadow-[#00A87E]/20 active:scale-95 transition-all">
            <Pill className="h-5 w-5 mr-2" /> Browse Medicines
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-muted/30 py-10 px-4 md:px-8 page-enter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/medicines"
            className="w-10 h-10 rounded-xl border border-border bg-surface flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-foreground">
              Shopping Cart
            </h1>
            <p className="text-sm text-muted-foreground font-medium">{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left: Items ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Prescription warning */}
            {hasPrescriptionItems && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-amber-800 mb-1">Prescription Required</p>
                  <p className="text-amber-700 text-sm mb-3">
                    One or more items in your cart need a valid prescription to be dispensed.
                  </p>
                  <Button onClick={handleUploadRx} size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl gap-2">
                    <Upload className="h-4 w-4" /> Upload Prescription
                  </Button>
                </div>
              </div>
            )}

            {/* Free delivery progress */}
            {subtotal < FREE_THRESHOLD && DELIVERY_FEE > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <p className="text-xs font-bold text-muted-foreground">
                      Add <span className="text-primary">₹{(FREE_THRESHOLD - subtotal).toFixed(0)}</span> more for FREE delivery
                    </p>
                    <p className="text-xs font-bold text-[#94A3B8]">₹{FREE_THRESHOLD}</p>
                  </div>
                  <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00A87E] to-[#059669] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / FREE_THRESHOLD) * 100)}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Item cards */}
            {items.map(item => {
              const unitPrice = item.discountedPrice ?? item.price
              const lineTotal = unitPrice * item.quantity

              return (
                <div key={item.id}
                  className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow hover:border-primary/20 transition-all group">
                  <div className="p-5 flex gap-5">
                    {/* Icon placeholder */}
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#E6F7F3] to-[#F0FDF4] flex items-center justify-center flex-shrink-0 border border-border">
                      <Pill className="h-8 w-8 text-primary/40" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-heading font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                        {item.requiresPrescription && (
                          <Badge className="bg-red-50 text-red-500 border-red-200 text-[9px] font-bold uppercase flex-shrink-0">
                            Rx
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#94A3B8] font-medium mb-3">By {item.manufacturer}</p>

                      <div className="flex items-center gap-5 flex-wrap">
                        {/* Unit price */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold mb-0.5">Unit Price</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-foreground">₹{unitPrice}</span>
                            {item.discountedPrice && (
                              <span className="text-xs text-[#94A3B8] line-through">₹{item.price}</span>
                            )}
                          </div>
                        </div>

                        <div className="h-8 w-px bg-surface-muted" />

                        {/* Qty control */}
                        <div className="flex items-center bg-surface-muted/30 rounded-xl border border-border p-0.5">
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-surface rounded-xl"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-9 text-center font-bold text-foreground text-sm">{item.quantity}</span>
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-surface rounded-xl"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="h-8 w-px bg-surface-muted" />

                        {/* Line total */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold mb-0.5">Total</p>
                          <span className="font-extrabold text-primary text-base">₹{lineTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button onClick={() => removeItem(item.id)}
                      className="text-[#CBD5E1] hover:text-red-500 transition-colors self-start mt-1 flex-shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Clear all */}
            <div className="flex justify-end pt-1">
              <button onClick={() => { clearCart(); toast.success("Cart cleared") }}
                className="text-xs font-bold text-[#94A3B8] hover:text-red-500 transition-colors flex items-center gap-1">
                <Trash2 className="h-3.5 w-3.5" /> Clear all items
              </button>
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:w-[380px] shrink-0">
            <div className="bg-surface rounded-2xl border border-border shadow-lg sticky top-24 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#00A87E] to-[#059669] px-6 py-5">
                <h2 className="font-heading text-lg font-bold text-white">Order Summary</h2>
                <p className="text-emerald-200 text-sm">{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Line items summary */}
                <div className="space-y-2.5">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium truncate mr-3 max-w-[200px]">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-foreground font-bold flex-shrink-0">
                        ₹{((item.discountedPrice ?? item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-surface-muted" />

                {/* Pricing breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" /> Delivery
                    </span>
                    {delivery === 0 ? (
                      <span className="text-primary font-bold">FREE</span>
                    ) : (
                      <span className="text-foreground font-bold">₹{delivery}</span>
                    )}
                  </div>
                  {delivery > 0 && (
                    <div className="bg-primary/10 rounded-xl px-3 py-2 text-xs text-primary font-semibold">
                      Add ₹{(FREE_THRESHOLD - subtotal).toFixed(0)} more to get FREE delivery 🎉
                    </div>
                  )}
                </div>

                <Separator className="bg-surface-muted" />

                {/* Grand total */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground text-base">Grand Total</span>
                  <span className="font-extrabold text-primary text-2xl">₹{total.toFixed(2)}</span>
                </div>

                {/* Coupon placeholder */}
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-surface-muted/30 rounded-xl border border-border px-3 h-10">
                    <Tag className="h-4 w-4 text-[#94A3B8]" />
                    <span className="text-sm text-[#94A3B8] font-medium">Enter coupon code</span>
                  </div>
                  <Button variant="outline" size="sm"
                    className="rounded-xl border-primary text-primary font-bold h-10 px-4 hover:bg-primary/10"
                    onClick={() => toast.info("Coupon system coming soon!")}>
                    Apply
                  </Button>
                </div>

                {/* CTA */}
                <Link href="/checkout" className="block">
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-xl shadow-lg shadow-[#00A87E]/20 transition-all active:scale-[0.98]">
                    Proceed to Checkout →
                  </Button>
                </Link>
                <Link href="/medicines" className="block">
                  <Button variant="outline"
                    className="w-full h-11 border-border text-muted-foreground font-bold rounded-xl hover:border-primary hover:text-primary transition-all">
                    ← Continue Shopping
                  </Button>
                </Link>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-2 pt-1 text-[#94A3B8]">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold tracking-wider uppercase">100% Secure Checkout</span>
                </div>
                <div className="flex justify-center gap-2">
                  {["VISA", "UPI", "MC", "GPay"].map(p => (
                    <div key={p} className="h-6 w-11 border border-border rounded bg-surface-muted/30 flex items-center justify-center text-[8px] font-bold text-[#94A3B8] tracking-wider">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
