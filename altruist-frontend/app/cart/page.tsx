"use client"

import React from "react"
import { useCartStore } from "@/store/cartStore"
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore()

  const subtotal = getTotalPrice()
  const deliveryFee = subtotal > 500 ? 0 : 49
  const total = subtotal + deliveryFee
  const hasPrescriptionItems = items.some((i) => i.requiresPrescription)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-slate-100 h-24 w-24 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="h-12 w-12 text-slate-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Looks like you haven't added any medicines to your cart yet. Explore our pharmacy to find original medicines.
        </p>
        <Link href="/medicines">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-12 py-6 text-lg shadow-xl shadow-teal-100">
            Browse Medicines
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/medicines" className="text-slate-400 hover:text-teal-600 transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-800">Shopping Cart ({getTotalItems()})</h1>
          </div>

          {hasPrescriptionItems && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start shadow-sm shadow-amber-50">
              <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-amber-800 mb-1">Prescription Required</h4>
                <p className="text-amber-700 text-sm opacity-90">
                  Some items in your cart require a valid prescription. Please upload your prescription at the checkout page to proceed with your order.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {items.map((item) => (
              <Card key={item.id} className="border-slate-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Item Info */}
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                          {item.name}
                        </h3>
                        {item.requiresPrescription && (
                          <Badge variant="destructive" className="h-fit">RX Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 font-medium mb-4 italic">By {item.manufacturer}</p>
                      <div className="flex items-center gap-6">
                         <div>
                            <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Price per unit</p>
                            <p className="font-bold text-slate-700">₹{item.discountedPrice ?? item.price}</p>
                         </div>
                         <div className="h-8 w-px bg-slate-100" />
                         <div>
                            <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Item Total</p>
                            <p className="font-extrabold text-teal-600">₹{(item.discountedPrice ?? item.price) * item.quantity}</p>
                         </div>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex md:flex-col items-center justify-between md:justify-center gap-4">
                      <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1 shadow-inner">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-500 hover:bg-white hover:text-teal-600"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-bold text-slate-800">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-500 hover:bg-white hover:text-teal-600"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-[400px]">
          <Card className="sticky top-24 border-teal-100 bg-white shadow-2xl shadow-teal-50">
            <CardHeader className="bg-teal-600/5 p-8 rounded-t-2xl">
              <CardTitle className="text-2xl font-bold text-teal-900">Order Summary</CardTitle>
            </CardHeader>
            <Separator className="bg-teal-100/50" />
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-teal-600">FREE</span>
                  ) : (
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  )}
                </div>
                {subtotal < 500 && (
                   <div className="bg-teal-50 p-3 rounded-xl border border-teal-100 mt-2">
                       <p className="text-xs text-teal-700 font-medium">Add items worth ₹{(500 - subtotal).toFixed(2)} more for FREE delivery!</p>
                   </div>
                )}
              </div>

              <Separator className="bg-slate-100" />

              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-slate-800">Total</span>
                <span className="text-3xl font-extrabold text-teal-600">₹{total.toFixed(2)}</span>
              </div>

              <div className="space-y-4 pt-4">
                <Link href="/checkout">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-8 text-lg font-bold shadow-xl shadow-teal-100 transition-all active:scale-[0.98]">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/medicines">
                  <Button variant="outline" className="w-full border-teal-600 text-teal-600 rounded-xl py-7 font-bold hover:bg-teal-50">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 justify-center pt-4 text-slate-400 text-xs font-semibold tracking-wider">
                 <ShieldCheck className="h-4 w-4" /> 100% SECURE CHECKOUT
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
