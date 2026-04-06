"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Search, ShoppingCart, Plus, Minus, AlertCircle, Pill, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useCartStore } from "@/store/cartStore"
import api from "@/lib/axios"
import { cn } from "@/lib/utils"

interface Medicine {
  id: string
  name: string
  genericName: string
  manufacturer: string
  category: string
  price: number
  discountedPrice: number | null
  requiresPrescription: boolean
  inStock: boolean
}

const CATEGORIES = [
  { label: "All", value: "all", emoji: "📦" },
  { label: "Tablets", value: "General", emoji: "💊" },
  { label: "Antibiotics", value: "Antibiotics", emoji: "🧬" },
  { label: "Pain Relief", value: "Pain Relief", emoji: "🩹" },
  { label: "Diabetes", value: "Diabetes", emoji: "📊" },
  { label: "Cardiac", value: "Cardiac", emoji: "❤️" },
  { label: "Skin Care", value: "Skin Care", emoji: "🧴" },
  { label: "Personal Care", value: "Personal Care", emoji: "🪥" },
]

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [prescriptionFilter, setPrescriptionFilter] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const { items, addItem, updateQuantity } = useCartStore()

  const fetchMedicines = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {
        page,
        size: 20,
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        prescription: prescriptionFilter || undefined,
      }
      const response = await api.get("/medicines", { params })
      setMedicines(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Error fetching medicines:", error)
    } finally {
      setLoading(false)
    }
  }, [page, search, category, prescriptionFilter])

  useEffect(() => {
    fetchMedicines()
  }, [fetchMedicines])

  const getItemQuantity = (id: string) => items.find((i) => i.id === id)?.quantity || 0

  const handleAddToCart = (medicine: Medicine) => {
    addItem({
      id: medicine.id,
      name: medicine.name,
      manufacturer: medicine.manufacturer,
      price: medicine.price,
      discountedPrice: medicine.discountedPrice,
      requiresPrescription: medicine.requiresPrescription,
      quantity: 1,
    })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Banner */}
      <section className="relative py-16 md:py-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #064E3B, #065F46)" }}>
        <div className="absolute inset-0 hero-grid-pattern" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center space-y-6">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Order Medicines Online
          </h1>
          <p className="text-lg text-emerald-200 font-medium max-w-xl mx-auto">
            Genuine medicines delivered to your doorstep in 24 hours. 100% authentic.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Input
              type="text"
              placeholder="Search by medicine name or generic name..."
              className="pl-12 h-14 text-[#0F172A] rounded-full w-full border-0 focus-visible:ring-2 focus-visible:ring-[#00A87E] bg-white shadow-2xl text-base font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] h-5 w-5" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {/* Category Chips */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setPage(0); }}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                category === cat.value
                  ? "bg-[#00A87E] text-white border-[#00A87E] shadow-lg shadow-[#00A87E]/20"
                  : "bg-white text-[#475569] border-[#E2E8F0] hover:border-[#00A87E] hover:text-[#00A87E]"
              )}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between bg-white p-5 rounded-2xl border border-[#E2E8F0]">
          <div className="flex items-center space-x-3">
            <Switch checked={prescriptionFilter} onCheckedChange={(val) => { setPrescriptionFilter(val); setPage(0); }} />
            <Label className="text-sm font-bold text-[#475569]">Prescription Required Only</Label>
          </div>
          <div className="text-sm font-bold text-[#475569]">
            Showing <span className="text-[#00A87E] font-extrabold">{medicines.length}</span> medicines
          </div>
        </div>

        {/* Medicines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-16 mt-3" />
                  <div className="h-11 bg-gray-100 rounded-xl mt-4" />
                </div>
              </div>
            ))
          ) : medicines.length > 0 ? (
            medicines.map((med) => (
              <div key={med.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden card-hover flex flex-col">
                {/* Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-[#E6F7F3] to-[#F0FDF4] flex items-center justify-center relative">
                  <Pill size={48} className="text-[#00A87E]/30" />
                  {med.requiresPrescription && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white border-none text-[10px] font-bold uppercase tracking-wide flex gap-1 items-center">
                      <AlertCircle className="h-3 w-3" /> Rx Required
                    </Badge>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <Badge className="bg-[#E6F7F3] text-[#00A87E] border-[#00A87E]/20 hover:bg-[#E6F7F3] w-fit mb-2 text-xs font-bold">
                    {med.category}
                  </Badge>
                  <h3 className="font-heading text-base font-bold text-[#0F172A] mb-1 line-clamp-1 group-hover:text-[#00A87E] transition-colors">
                    {med.name}
                  </h3>
                  <p className="text-xs text-[#475569] mb-1">Generic: {med.genericName}</p>
                  <p className="text-xs text-[#475569] mb-4 font-medium">By {med.manufacturer}</p>

                  <div className="flex items-baseline gap-2 mt-auto mb-4">
                    <span className="font-display text-2xl font-bold text-[#0F172A]">
                      ₹{med.discountedPrice ?? med.price}
                    </span>
                    {med.discountedPrice && (
                      <span className="text-sm text-[#475569] line-through">₹{med.price}</span>
                    )}
                    {med.discountedPrice && (
                      <Badge className="bg-[#10B981]/10 text-[#10B981] border-none text-xs font-bold">
                        {Math.round((1 - med.discountedPrice / med.price) * 100)}% off
                      </Badge>
                    )}
                  </div>

                  {getItemQuantity(med.id) > 0 ? (
                    <div className="flex items-center justify-between bg-[#E6F7F3] rounded-xl p-1 border border-[#00A87E]/20">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-[#00A87E] hover:bg-white rounded-lg"
                        onClick={() => updateQuantity(med.id, getItemQuantity(med.id) - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-[#0F172A] text-lg">{getItemQuantity(med.id)}</span>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-[#00A87E] hover:bg-white rounded-lg"
                        onClick={() => updateQuantity(med.id, getItemQuantity(med.id) + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full h-11 bg-white text-[#00A87E] border-2 border-[#00A87E] hover:bg-[#00A87E] hover:text-white rounded-xl font-bold transition-all active:scale-95 gap-2"
                      onClick={() => handleAddToCart(med)}>
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center space-y-6">
              <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-[#E2E8F0]">
                <Package className="h-12 w-12 text-gray-300" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-[#0F172A] mb-2">No Medicines Found</h3>
                <p className="text-[#475569] mb-6 max-w-md mx-auto">We couldn&apos;t find medicines matching your criteria. Try adjusting your search or filters.</p>
                <Button variant="outline" onClick={() => { setSearch(""); setCategory("all"); setPrescriptionFilter(false); }}
                  className="border-[#00A87E] text-[#00A87E] hover:bg-[#E6F7F3] font-bold px-8 rounded-xl">
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <Button
                key={idx}
                variant={page === idx ? "default" : "outline"}
                className={cn("rounded-xl font-bold", page === idx ? "bg-[#00A87E] hover:bg-[#007A5C]" : "text-[#00A87E] border-[#E2E8F0]")}
                onClick={() => setPage(idx)}
              >
                {idx + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
