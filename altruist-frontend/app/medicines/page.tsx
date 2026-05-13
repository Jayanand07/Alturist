"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import {
  Search, ShoppingCart, Plus, Minus, AlertCircle, Pill, Package,
  SlidersHorizontal, X, ChevronDown, ArrowUpDown,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useCartStore } from "@/store/cartStore"
import api from "@/lib/axios"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
  stockQuantity: number
  description?: string
  imageUrl?: string
}

const CATEGORIES = [
  { label: "All",           value: "all",               emoji: "📦" },
  { label: "General",       value: "General",            emoji: "💊" },
  { label: "Antibiotics",   value: "Antibiotics",        emoji: "🧬" },
  { label: "Pain Relief",   value: "Painkillers",        emoji: "🩹" },
  { label: "Vitamins",      value: "Vitamins",           emoji: "🌿" },
  { label: "Multivitamins", value: "Multivitamins",      emoji: "💎" },
  { label: "Iron",          value: "Iron Supplements",   emoji: "🔴" },
  { label: "Calcium",       value: "Calcium & Bone Care",emoji: "🦴" },
  { label: "Diabetes",      value: "Diabetes",           emoji: "📊" },
  { label: "Cardiac",       value: "Cardiac",            emoji: "❤️" },
  { label: "Skin Care",     value: "Dermatology",        emoji: "🧴" },
  { label: "Personal Care", value: "Personal Care",      emoji: "🪥" },
]

const SORT_OPTIONS = [
  { label: "Relevance",      value: "relevance"   },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc"},
  { label: "Name A–Z",       value: "name_asc"    },
  { label: "Name Z–A",       value: "name_desc"   },
]

const DELIVERY_THRESHOLD = 500
const DELIVERY_FEE = 49

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function MedicinesPage() {
  const [medicines,  setMedicines]  = useState<Medicine[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState("")
  const [category,   setCategory]   = useState("all")
  const [rxOnly,     setRxOnly]     = useState(false)
  const [maxPrice,   setMaxPrice]   = useState(2000)
  const [sortBy,     setSortBy]     = useState("relevance")
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total,      setTotal]      = useState(0)
  const [sidebarOpen,setSidebarOpen]= useState(false)

  const debouncedSearch = useDebounce(search, 300)
  const { items, addItem, updateQuantity, getTotalItems } = useCartStore()
  const cartCount = getTotalItems()

  const getQty = (id: string) => items.find(i => i.id === id)?.quantity ?? 0

  const fetchMedicines = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { page, size: 20 }
      if (debouncedSearch) params.search = debouncedSearch
      if (category !== "all") params.category = category
      if (rxOnly) params.prescription = true
      if (sortBy === "price_asc")  { params.sortBy = "price"; params.sortDir = "asc"  }
      if (sortBy === "price_desc") { params.sortBy = "price"; params.sortDir = "desc" }
      if (sortBy === "name_asc")   { params.sortBy = "name";  params.sortDir = "asc"  }
      if (sortBy === "name_desc")  { params.sortBy = "name";  params.sortDir = "desc" }

      const res = await api.get("/medicines", { params })
      let data: Medicine[] = res.data?.content ?? res.data ?? []

      // client-side price filter (backend may not support it)
      data = data.filter(m => (m.discountedPrice ?? m.price) <= maxPrice)

      setMedicines(data)
      setTotalPages(res.data?.totalPages ?? 1)
      setTotal(res.data?.totalElements ?? data.length)
    } catch {
      toast.error("Failed to load medicines")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, category, rxOnly, maxPrice, sortBy])

  useEffect(() => { fetchMedicines() }, [fetchMedicines])

  // reset page when filters change
  useEffect(() => { setPage(0) }, [debouncedSearch, category, rxOnly, maxPrice, sortBy])

  const handleAdd = (med: Medicine) => {
    addItem({
      id: med.id, name: med.name, manufacturer: med.manufacturer,
      price: med.price, discountedPrice: med.discountedPrice,
      requiresPrescription: med.requiresPrescription, quantity: 1,
    })
    toast.success(`${med.name} added to cart`, { icon: "🛒" })
  }

  const clearFilters = () => {
    setSearch(""); setCategory("all"); setRxOnly(false)
    setMaxPrice(2000); setSortBy("relevance")
  }

  const activeFilterCount = [
    category !== "all", rxOnly, maxPrice < 2000, sortBy !== "relevance",
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Hero ── */}
      <section className="relative py-14 md:py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #064E3B 0%, #065F46 60%, #047857 100%)" }}>
        <div className="absolute inset-0 hero-grid-pattern opacity-40" />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-[#00A87E]/20 blur-2xl" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center space-y-6">
          <Badge className="bg-white/10 text-emerald-200 border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            100% Authentic Medicines
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Order Medicines Online
          </h1>
          <p className="text-lg text-emerald-200 font-medium max-w-lg mx-auto">
            Genuine medicines delivered to your doorstep in 24 hours.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Input
              type="text"
              placeholder="Search by medicine name, generic name..."
              className="pl-14 pr-5 h-14 text-[#0F172A] rounded-2xl w-full border-0 focus-visible:ring-2 focus-visible:ring-[#00A87E] bg-white shadow-2xl text-base font-medium"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#475569] h-5 w-5" />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Trust strip */}
          <div className="flex items-center justify-center gap-6 flex-wrap pt-2">
            {["🚚 Free delivery ₹500+", "✅ 100% Genuine", "⚡ 24h delivery", "🔒 Secure checkout"].map(t => (
              <span key={t} className="text-xs text-emerald-200/80 font-semibold">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* ── Category chips ── */}
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                category === cat.value
                  ? "bg-[#00A87E] text-white border-[#00A87E] shadow-lg shadow-[#00A87E]/20"
                  : "bg-white text-[#475569] border-[#E2E8F0] hover:border-[#00A87E] hover:text-[#00A87E]"
              )}>
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div className="flex flex-wrap gap-3 mb-6 items-center justify-between bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Mobile filter toggle */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all md:hidden",
                sidebarOpen ? "bg-[#00A87E] text-white border-[#00A87E]" : "border-[#E2E8F0] text-[#475569]"
              )}>
              <SlidersHorizontal size={14} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={15} className="text-[#475569]" />
              <Select value={sortBy} onValueChange={v => setSortBy(v || "relevance")}>
                <SelectTrigger className="h-9 rounded-xl border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-sm w-[180px] focus:ring-[#00A87E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {SORT_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="font-medium">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rx toggle (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <Switch checked={rxOnly} onCheckedChange={setRxOnly} />
              <Label className="text-sm font-semibold text-[#475569] cursor-pointer">Rx Required</Label>
            </div>

            {/* Price slider (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <Label className="text-xs font-bold text-[#475569] whitespace-nowrap">Max ₹{maxPrice}</Label>
              <input type="range" min={50} max={2000} step={50} value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-32 accent-[#00A87E]" />
            </div>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                <X size={12} /> Clear
              </button>
            )}
          </div>

          <p className="text-sm font-bold text-[#475569]">
            <span className="text-[#00A87E] font-extrabold">{total}</span> medicines
          </p>
        </div>

        {/* Mobile filter panel */}
        {sidebarOpen && (
          <div className="md:hidden bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between">
              <Switch checked={rxOnly} onCheckedChange={setRxOnly} />
              <Label className="text-sm font-semibold text-[#475569]">Prescription Required Only</Label>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs font-bold text-[#475569]">Max Price</Label>
                <span className="text-xs font-extrabold text-[#00A87E]">₹{maxPrice}</span>
              </div>
              <input type="range" min={50} max={2000} step={50} value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#00A87E]" />
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-medium">
                <span>₹50</span><span>₹2,000</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="h-40 skeleton" />
                <div className="p-5 space-y-3">
                  <div className="skeleton skeleton-sm w-16" />
                  <div className="skeleton skeleton-md w-3/4" />
                  <div className="skeleton skeleton-sm w-1/2" />
                  <div className="skeleton skeleton-xl rounded-xl mt-2" />
                </div>
              </div>
            ))
          ) : medicines.length > 0 ? (
            medicines.map(med => {
              const qty = getQty(med.id)
              const displayPrice = med.discountedPrice ?? med.price
              const discount = med.discountedPrice
                ? Math.round((1 - med.discountedPrice / med.price) * 100) : 0

              return (
                <div key={med.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden card-hover flex flex-col group">
                  {/* Image */}
                  <div className="h-44 bg-gradient-to-br from-[#E6F7F3] to-[#F0FDF4] flex items-center justify-center relative">
                    {med.imageUrl ? (
                      <img src={med.imageUrl} alt={med.name} className="h-full w-full object-contain p-4" />
                    ) : (
                      <Pill size={52} className="text-[#00A87E]/25" />
                    )}
                    {med.requiresPrescription && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="h-2.5 w-2.5" /> Rx
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-3 right-3 bg-[#10B981] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {discount}% OFF
                      </span>
                    )}
                    {!med.inStock && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#475569] bg-white px-3 py-1 rounded-full border border-[#E2E8F0]">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <Badge className="bg-[#E6F7F3] text-[#00A87E] border-[#00A87E]/20 hover:bg-[#E6F7F3] w-fit mb-2 text-[10px] font-bold uppercase tracking-wide">
                      {med.category}
                    </Badge>
                    <h3 className="font-heading text-sm font-bold text-[#0F172A] mb-0.5 line-clamp-2 group-hover:text-[#00A87E] transition-colors leading-snug">
                      {med.name}
                    </h3>
                    {med.genericName && (
                      <p className="text-[11px] text-[#94A3B8] mb-0.5 italic">{med.genericName}</p>
                    )}
                    <p className="text-[11px] text-[#475569] font-medium mb-3">By {med.manufacturer}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-auto mb-3">
                      <span className="font-display text-xl font-extrabold text-[#0F172A]">₹{displayPrice}</span>
                      {med.discountedPrice && (
                        <span className="text-sm text-[#94A3B8] line-through">₹{med.price}</span>
                      )}
                    </div>

                    {/* Cart control */}
                    {!med.inStock ? (
                      <Button variant="outline" disabled
                        className="w-full h-10 rounded-xl font-bold text-[#94A3B8] border-[#E2E8F0] text-sm">
                        Out of Stock
                      </Button>
                    ) : qty > 0 ? (
                      <div className="flex items-center justify-between bg-[#E6F7F3] rounded-xl p-0.5 border border-[#00A87E]/20">
                        <Button variant="ghost" size="icon"
                          className="h-9 w-9 text-[#00A87E] hover:bg-white rounded-lg"
                          onClick={() => updateQuantity(med.id, qty - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-[#0F172A] text-base min-w-[24px] text-center">{qty}</span>
                        <Button variant="ghost" size="icon"
                          className="h-9 w-9 text-[#00A87E] hover:bg-white rounded-lg"
                          onClick={() => updateQuantity(med.id, qty + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full h-10 bg-white text-[#00A87E] border-2 border-[#00A87E] hover:bg-[#00A87E] hover:text-white rounded-xl font-bold transition-all active:scale-95 text-sm"
                        onClick={() => handleAdd(med)}>
                        <ShoppingCart className="h-4 w-4 mr-1.5" /> Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-24 text-center space-y-5">
              <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-[#E2E8F0]">
                <Package className="h-12 w-12 text-gray-300" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-[#0F172A] mb-2">No Medicines Found</h3>
                <p className="text-[#475569] mb-6 max-w-md mx-auto">
                  No results match your current filters. Try adjusting your search or criteria.
                </p>
                <Button onClick={clearFilters}
                  className="bg-[#00A87E] hover:bg-[#007A5C] text-white font-bold px-8 rounded-xl">
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="rounded-xl font-bold border-[#E2E8F0]">← Prev</Button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
              <Button key={i} onClick={() => setPage(i)}
                className={cn("rounded-xl font-bold w-10", page === i
                  ? "bg-[#00A87E] hover:bg-[#007A5C] text-white"
                  : "bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#00A87E] hover:text-[#00A87E]")}>
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="rounded-xl font-bold border-[#E2E8F0]">Next →</Button>
          </div>
        )}
      </div>

      {/* Floating cart badge */}
      {cartCount > 0 && (
        <Link href="/cart"
          className="fixed bottom-6 right-6 z-50 bg-[#00A87E] text-white rounded-2xl px-5 py-3.5 shadow-xl shadow-[#00A87E]/30 flex items-center gap-3 font-bold hover:bg-[#007A5C] transition-all active:scale-95 teal-glow">
          <ShoppingCart className="h-5 w-5" />
          <span>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
          <span className="bg-white text-[#00A87E] rounded-xl px-2 py-0.5 text-xs font-extrabold">View</span>
        </Link>
      )}
    </div>
  )
}
