"use client"

import React, { useState } from "react"
import { useCartStore } from "@/store/cartStore"
import { ArrowLeft, CreditCard, Home, Phone, User, FileText, CheckCircle2, AlertCircle, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios"
import { cn } from "@/lib/utils"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  })

  // Auth Guard: Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  React.useEffect(() => {
    if (user?.displayName) {
      setFormData((prev) => prev.fullName ? prev : { ...prev, fullName: user.displayName || "" })
    }
  }, [user])

  const subtotal = getTotalPrice()
  let deliveryFee = 0
  const total = subtotal + deliveryFee
  const hasPrescriptionItems = items.some((i) => i.requiresPrescription)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (hasPrescriptionItems) {
      setFormError("Prescription medicine checkout needs secure prescription upload before the order can be placed.")
      return
    }

    setLoading(true)

    try {
      const deliveryAddress = `${formData.fullName}, ${formData.phone}, ${formData.addressLine1}, ${formData.addressLine2}, ${formData.city}, ${formData.state} - ${formData.pincode}`
      
      const orderData = {
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          manufacturer: i.manufacturer,
          price: i.price,
          discountedPrice: i.discountedPrice,
          quantity: i.quantity,
          subtotal: (i.discountedPrice ?? i.price) * i.quantity
        })),
        totalAmount: total,
        deliveryAddress: deliveryAddress,
        prescriptionUrl: null,
        paymentMethod: paymentMethod
      }

      await api.post("/orders", orderData)
      
      setOrderPlaced(true)
      clearCart()
      
      setTimeout(() => {
        router.push("/patient")
      }, 3000)
    } catch (error: unknown) {
      console.error("Error placing order:", error instanceof Error ? error.message : "Unknown order error")
      setFormError("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (!authLoading && user && items.length === 0 && !orderPlaced) {
      router.push("/medicines")
    }
  }, [authLoading, user, items.length, orderPlaced, router])

  if (authLoading || !user || (items.length === 0 && !orderPlaced)) return null

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="bg-primary/10 h-32 w-32 rounded-full flex items-center justify-center mb-8 shadow-inner">
           <CheckCircle2 className="h-16 w-16 text-primary animate-bounce" />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-800 mb-4">Order Placed Successfully!</h2>
        <p className="text-slate-500 text-lg mb-8 max-w-md">
           Thank you for your order! Your medicines will be delivered shortly. You are being redirected to your dashboard...
        </p>
        <Link href="/patient">
           <Button className="bg-primary hover:bg-primary/90 rounded-xl px-10 py-6 text-lg shadow-xl shadow-primary/10">
              Go to Dashboard Now
           </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <form onSubmit={handlePlaceOrder} className="flex-1 space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/cart" className="text-slate-400 hover:text-primary transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Checkout</h1>
          </div>

          {formError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {formError}
            </div>
          )}

          {/* Delivery Address */}
          <Card className="border-slate-100 shadow-xl shadow-slate-50">
            <CardHeader className="p-8 border-b border-slate-50">
               <CardTitle className="text-xl flex items-center gap-3 font-bold text-slate-800">
                  <Home className="h-5 w-5 text-primary" /> Delivery Address
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</Label>
                     <div className="relative">
                        <Input 
                           name="fullName" value={formData.fullName} onChange={handleInputChange} required 
                           className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-surface" 
                           placeholder="Enter your name"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</Label>
                     <div className="relative">
                        <Input 
                           name="phone" value={formData.phone} onChange={handleInputChange} required 
                           className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-surface" 
                           placeholder="Mobile number"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     </div>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Address Line 1</Label>
                  <Input 
                     name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} required 
                     className="rounded-xl bg-slate-50 border-slate-200 focus:bg-surface" 
                     placeholder="House no, Street name"
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Address Line 2 (Optional)</Label>
                  <Input 
                     name="addressLine2" value={formData.addressLine2} onChange={handleInputChange}
                     className="rounded-xl bg-slate-50 border-slate-200 focus:bg-surface" 
                     placeholder="Landmark, Locality"
                  />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">City</Label>
                     <Input 
                        name="city" value={formData.city} onChange={handleInputChange} required 
                        className="rounded-xl bg-slate-50 border-slate-200 focus:bg-surface" 
                        placeholder="City"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">State</Label>
                     <Input 
                        name="state" value={formData.state} onChange={handleInputChange} required 
                        className="rounded-xl bg-slate-50 border-slate-200 focus:bg-surface" 
                        placeholder="State"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Pincode</Label>
                     <Input 
                        name="pincode" value={formData.pincode} onChange={handleInputChange} required 
                        className="rounded-xl bg-slate-50 border-slate-200 focus:bg-surface" 
                        placeholder="6-digit PIN"
                     />
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* Prescription Section */}
          {hasPrescriptionItems && (
             <Card className="border-slate-100 shadow-xl shadow-slate-50 overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 bg-amber-50/50">
                  <CardTitle className="text-xl flex items-center gap-3 font-bold text-slate-800">
                      <FileText className="h-5 w-5 text-amber-500" /> Upload Prescription
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4 mb-6">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                         Items in your cart require a medical prescription. Please upload a clear photo or PDF of your prescription.
                      </p>
                   </div>
                   <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-teal-400 transition-colors cursor-pointer bg-slate-50/30">
                      <Input type="file" id="prescription" className="hidden" accept=".jpg,.png,.pdf" />
                      <Label htmlFor="prescription" className="cursor-pointer">
                         <div className="flex flex-col items-center">
                            <div className="bg-surface h-12 w-12 rounded-full shadow-sm hover:shadow-md transition-shadow flex items-center justify-center mb-4">
                               <Plus className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-bold text-slate-800 mb-1">Upload Prescription</p>
                            <p className="text-xs text-slate-400">Accepted: JPG, PNG, PDF (Max 5MB)</p>
                         </div>
                      </Label>
                   </div>
                </CardContent>
             </Card>
          )}

          {/* Payment Section */}
          <Card className="border-slate-100 shadow-xl shadow-slate-50">
             <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-xl flex items-center gap-3 font-bold text-slate-800">
                   <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* COD Option */}
                   <div 
                      onClick={() => setPaymentMethod("COD")}
                      className={cn(
                         "border rounded-2xl p-6 cursor-pointer transition-all flex items-start gap-4 hover:border-primary/50",
                         paymentMethod === "COD" 
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/5" 
                            : "border-slate-100 bg-slate-50/50"
                      )}
                   >
                      <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                         paymentMethod === "COD" 
                            ? "bg-primary text-white border-primary/20" 
                            : "bg-white text-slate-400 border-slate-200"
                      )}>
                         <Home size={18} />
                      </div>
                      <div className="space-y-1">
                         <p className="font-extrabold text-sm text-slate-800">Cash on Delivery (COD)</p>
                         <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                            Pay with cash or scan dynamic UPI QR code at your doorstep during delivery.
                         </p>
                      </div>
                   </div>

                   {/* Online Payment Option */}
                   <div className="border border-slate-100 bg-slate-50/30 rounded-2xl p-6 opacity-60 cursor-not-allowed flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white text-slate-300 border border-slate-100 flex items-center justify-center shrink-0">
                         <CreditCard size={18} />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <p className="font-extrabold text-sm text-slate-400">Online Payment / Cards</p>
                            <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Soon</span>
                         </div>
                         <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                            Securely pay online via UPI, Credit/Debit Cards, or Net Banking.
                         </p>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>
        </form>

        {/* Order Summary Sidebar */}
        <div className="lg:w-[400px]">
           <Card className="sticky top-24 border-slate-100 shadow-2xl shadow-slate-50">
              <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
                 <CardTitle className="text-xl font-bold text-slate-800">Review Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="max-h-[300px] overflow-y-auto p-8 space-y-4">
                    {items.map((item) => (
                       <div key={item.id} className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                             <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
                             <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-700">₹{((item.discountedPrice ?? item.price) * item.quantity).toFixed(2)}</p>
                       </div>
                    ))}
                 </div>
                 <Separator className="bg-slate-100" />
                 <div className="p-8 space-y-4 bg-primary/10/30">
                    <div className="flex justify-between text-slate-500 text-sm font-medium">
                       <span>Subtotal</span>
                       <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-sm font-medium">
                       <span>Delivery Fee</span>
                       {deliveryFee === 0 ? <span className="text-primary">FREE</span> : <span>₹{deliveryFee.toFixed(2)}</span>}
                    </div>
                    <Separator className="bg-slate-100" />
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-lg font-bold text-slate-800">Order Total</span>
                       <span className="text-2xl font-extrabold text-primary">₹{total.toFixed(2)}</span>
                    </div>
                    <Button 
                       type="submit" 
                       disabled={loading}
                       onClick={handlePlaceOrder}
                       className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-8 text-lg font-bold shadow-xl shadow-primary/10 mt-6"
                    >
                       {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Place Order & Pay"}
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
