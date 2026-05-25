"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import {
  Search, ShoppingCart, Plus, Minus, AlertCircle, Pill, Package,
  SlidersHorizontal, X, ChevronDown, ArrowUpDown, FileText,
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
import { useLanguage } from "@/context/LanguageContext"

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

const CONDITIONS = [
  { label: "Diabetes Care", emoji: "🩸" },
  { label: "Cardiac Care", emoji: "❤️" },
  { label: "Stomach Care", emoji: "🦠" },
  { label: "Pain Relief", emoji: "🦵" },
  { label: "Liver Care", emoji: "💊" },
  { label: "Oral Care", emoji: "🦷" },
  { label: "Respiratory", emoji: "🫁" },
  { label: "Sexual Health", emoji: "🩺" },
  { label: "Elderly Care", emoji: "👵" },
  { label: "Cold & Immunity", emoji: "🤧" },
]

export default function MedicinesPage() {
  const { t } = useLanguage()
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
      if (sortBy === "price_asc")  { params.sort = "price,asc" }
      if (sortBy === "price_desc") { params.sort = "price,desc" }
      if (sortBy === "name_asc")   { params.sort = "name,asc" }
      if (sortBy === "name_desc")  { params.sort = "name,desc" }

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
    <div className="min-h-screen bg-surface-muted/30 pb-20">
      {/* ── Sub Navigation ── */}
      <div className="bg-[#0b5e39] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex gap-6 overflow-x-auto whitespace-nowrap hide-scrollbar font-medium text-sm">
          <span className="cursor-pointer hover:font-bold">Apollo Products</span>
          <span className="cursor-pointer hover:font-bold">Baby Care</span>
          <span className="cursor-pointer hover:font-bold">Nutritional Drinks</span>
          <span className="cursor-pointer hover:font-bold">Women Care</span>
          <span className="cursor-pointer hover:font-bold">Personal Care</span>
          <span className="cursor-pointer hover:font-bold">Ayurveda</span>
          <span className="cursor-pointer hover:font-bold">Health Devices</span>
          <span className="cursor-pointer hover:font-bold">Home Essentials</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative py-14 overflow-hidden"
        style={{ background: "linear-gradient(90deg, #094F30 0%, #0d5c3a 50%, #094F30 100%)" }}>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center flex flex-col items-center space-y-6">
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-[#fcEAD4] tracking-tight">
            {t('medicines.title')}
          </h1>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative w-full mt-4">
            <Input
              type="text"
              placeholder={t('medicines.searchPlaceholder')}
              className="pl-12 pr-5 h-14 text-[#0F172A] rounded-md w-full border-0 focus-visible:ring-2 focus-visible:ring-[#E8593C] bg-white shadow-xl text-base font-medium"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-6 w-6" />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] transition-colors">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:block absolute left-10 bottom-0 pointer-events-none opacity-80 h-[250px] w-[250px]">
           <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[120%] h-[120%] object-contain -scale-x-100 opacity-60" style={{ filter: "brightness(0.9) contrast(1.1) saturate(1.2)"}}>
             <circle cx="100" cy="100" r="80" fill="#E7F4F1" />
             <path d="M60 140V80C60 68.9543 68.9543 60 80 60H120C131.046 60 140 68.9543 140 80V140" stroke="#0D9373" strokeWidth="6" strokeLinecap="round" />
             <path d="M50 140H150" stroke="#0D9373" strokeWidth="8" strokeLinecap="round" />
             <rect x="85" y="85" width="30" height="30" rx="6" fill="#E8593C" />
             <path d="M100 92V108M92 100H108" stroke="white" strokeWidth="4" strokeLinecap="round" />
             <circle cx="150" cy="70" r="15" fill="#FCEBE7" />
             <path d="M145 70H155" stroke="#E8593C" strokeWidth="3" strokeLinecap="round" />
             <circle cx="50" cy="70" r="12" fill="#E7F4F1" />
           </svg>
        </div>
        <div className="hidden lg:block absolute right-10 bottom-0 pointer-events-none opacity-80 h-[250px] w-[250px]">
           <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[120%] h-[120%] object-contain opacity-60" style={{ filter: "brightness(0.9) contrast(1.1) saturate(1.2)"}}>
             <circle cx="100" cy="100" r="80" fill="#FCEBE7" />
             <path d="M100 50C70 50 60 80 60 110C60 140 80 150 100 150C120 150 140 140 140 110C140 80 130 50 100 50Z" fill="#E7F4F1" />
             <path d="M100 40V160M60 100H140" stroke="#0D9373" strokeWidth="2" strokeDasharray="4 4" />
             <path d="M70 110C80 90 90 85 100 110C110 135 120 130 130 110" stroke="#E8593C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
             <circle cx="100" cy="110" r="8" fill="#0D9373" />
             <path d="M125 65C135 65 145 75 145 85" stroke="#0D9373" strokeWidth="4" strokeLinecap="round" />
           </svg>
        </div>

      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* ── Apollo Quick Action Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { title: t("medicines.uploadPresc"), sub: t("medicines.get20Off"), img: "📝" },
              { title: t("medicines.docAppt"), sub: t("medicines.startingPrice"), img: "👨‍⚕️" },
              { title: t("medicines.healthIns"), sub: t("medicines.protectFamily"), img: "🛡️" },
              { title: t("medicines.labTests"), sub: t("medicines.freeHomeSample"), img: "💉" }
            ].map((p, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#E8593C] transition-colors group">
                 <div>
                    <p className="font-bold text-slate-900 group-hover:text-[#E8593C] transition-colors line-clamp-1">{p.title}</p>
                    <p className="text-xs text-slate-500 font-medium">{p.sub}</p>
                 </div>
                 <div className="text-3xl bg-slate-50 p-2 rounded-full shrink-0 group-hover:bg-[#FCEBE7] transition-colors">{p.img}</div>
              </div>
            ))}
        </div>

        {/* ── Browse by Conditions ── */}
        <h2 className="font-heading text-xl font-bold text-slate-900 mb-6">{t("medicines.browseConditions")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
           {CONDITIONS.map(c => (
              <div key={c.label} onClick={() => setCategory(c.label)} className="bg-white px-2 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all group">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-slate-100 transition-colors shrink-0">
                  {c.emoji}
                </div>
                <span className="font-bold text-sm text-slate-800 group-hover:text-[#E8593C] line-clamp-2">{c.label}</span>
              </div>
           ))}
        </div>
        {/* ── Main Layout ── */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="font-heading text-lg font-bold text-slate-900">{t('medicines.filterBy')}</h2>
              {activeFilterCount > 0 && <button onClick={clearFilters} className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors">{t('medicines.clearAll')}</button>}
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">{t('medicines.category')}</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 <button
                    onClick={() => setCategory("all")}
                    className={`w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors ${category === "all" ? "bg-[#FCEBE7] text-[#E8593C] font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {t('medicines.allCategories')}
                 </button>
                 {CATEGORIES.filter(c => c.value !== "all").map(cat => (
                   <button
                     key={cat.value}
                     onClick={() => setCategory(cat.value)}
                     className={`w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors ${category === cat.value ? "bg-[#FCEBE7] text-[#E8593C] font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                   >
                     {cat.label}
                   </button>
                 ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">{t('medicines.prescRequired')}</Label>
              <div className="flex flex-col gap-2 text-sm text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="rx" checked={!rxOnly} onChange={() => setRxOnly(false)} className="text-[#0d5c3a] focus:ring-[#0d5c3a]" /> {t('medicines.all')}
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="rx" checked={rxOnly} onChange={() => setRxOnly(true)} className="text-[#0d5c3a] focus:ring-[#0d5c3a]" /> {t('medicines.yes')}
                </label>
              </div>
            </div>

            <div>
               <Label className="text-sm font-semibold text-slate-700 mb-2 block flex justify-between">
                 <span>{t('medicines.priceRange')}</span>
                 <span className="text-slate-500 font-normal">₹{maxPrice.toFixed(0)}</span>
               </Label>
               <input 
                 type="range" 
                 min={50} max={2000} step={50}
                 value={maxPrice} 
                 onChange={e => setMaxPrice(Number(e.target.value))}
                 className="w-full accent-[#0d5c3a] bg-slate-200 rounded-lg appearance-none h-1"
               />
               <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
                 <span>₹50</span>
                 <span>₹2,000+</span>
               </div>
            </div>
          </div>

          <div className="flex-1">
             {/* ── Sort / Mobile Filter Bar ── */}
             <div className="flex flex-wrap gap-3 mb-6 items-center justify-between pb-4 border-b border-border">
                <h2 className="font-heading text-2xl font-bold text-slate-900 hidden lg:block">
                  {category === "all" ? t('medicines.allCategories') : CATEGORIES.find(c => c.value === category)?.label || category}
                  <span className="text-sm font-normal text-slate-500 ml-2">({total} {t('medicines.items')})</span>
                </h2>

                <div className="flex items-center gap-4 flex-wrap w-full lg:w-auto">
                  {/* Mobile filter toggle */}
                  <button onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all lg:hidden",
                      sidebarOpen ? "bg-[#0d5c3a] text-white border-[#0d5c3a]" : "bg-white border-border text-slate-700"
                    )}>
                    <SlidersHorizontal size={14} />
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </button>

                  <div className="flex items-center gap-2 ml-auto lg:ml-0">
                    <span className="text-sm text-slate-500 font-medium hidden sm:inline">{t('medicines.sortBy')}</span>
                    <select className="bg-white border border-slate-300 rounded-md text-sm font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 focus:border-[#0d5c3a] w-[160px] sm:w-[180px]" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                      <option value="relevance">{t('medicines.relevance')}</option>
                      <option value="price_asc">{t('medicines.priceLowHigh')}</option>
                      <option value="price_desc">{t('medicines.priceHighLow')}</option>
                    </select>
                  </div>
                </div>
             </div>

             {/* Mobile filter panel */}
             {sidebarOpen && (
                <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">{t('medicines.prescRequired')}</span>
                    <Switch checked={rxOnly} onCheckedChange={setRxOnly} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs font-bold text-slate-700">Max Price</Label>
                      <span className="text-xs font-bold text-[#0d5c3a]">₹{maxPrice}</span>
                    </div>
                    <input type="range" min={50} max={2000} step={50} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-[#0d5c3a] bg-slate-200 h-1 rounded-lg appearance-none" />
                  </div>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-sm font-bold text-rose-500 w-full text-center py-2">{t('medicines.clearAll')}</button>
                  )}
                </div>
             )}

             {/* ── Grid ── */}
             <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
               {loading ? (
                 Array.from({ length: 8 }).map((_, i) => (
                   <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-[320px] flex flex-col animate-pulse">
                     <div className="h-32 bg-slate-100 rounded-lg mb-4" />
                     <div className="h-4 bg-slate-100 rounded-md w-3/4 mb-2" />
                     <div className="h-3 bg-slate-100 rounded-md w-1/2 mb-auto" />
                     <div className="h-8 bg-slate-100 rounded-md w-full mt-4" />
                   </div>
                 ))
               ) : medicines.length > 0 ? (
                 medicines.map(med => {
                   const qty = getQty(med.id)
                   const displayPrice = med.discountedPrice ?? med.price
                   const discount = med.discountedPrice
                     ? Math.round((1 - med.discountedPrice / med.price) * 100) : 0

                   return (
                     <div key={med.id} className="group bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-lg hover:border-[#E8593C]/40 transition-all duration-300 flex flex-col relative overflow-hidden">
                       
                       {/* Tags */}
                       <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 items-start">
                         {med.requiresPrescription && (
                           <div className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-1 rounded border border-rose-100 uppercase flex items-center gap-1">
                             <FileText size={10} /> Rx
                           </div>
                         )}
                       </div>
                       
                       {/* Image Area */}
                       <div className="relative h-32 w-full mb-4 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500">
                         {med.imageUrl ? (
                           <img src={med.imageUrl} alt={med.name} className="h-full w-full object-contain" loading="lazy" />
                         ) : (
                           <div className="text-4xl">💊</div>
                         )}
                       </div>
                       
                       {/* Info */}
                       <div className="flex-1 flex flex-col text-left">
                         <h3 className="font-bold text-sm text-slate-900 leading-tight mb-1 group-hover:text-[#E8593C] transition-colors line-clamp-2" title={med.name}>
                           {med.name}
                         </h3>
                         {med.genericName && (
                           <p className="text-[11px] text-slate-500 line-clamp-1 mb-1 italic" title={med.genericName}>
                             {med.genericName}
                           </p>
                         )}
                         <p className="text-[10px] text-slate-400 font-medium uppercase mb-2 line-clamp-1">{med.manufacturer}</p>
                         
                         <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-2">
                           <div className="flex items-end gap-2 flex-wrap w-full">
                             <span className="text-lg font-black text-slate-900">₹{displayPrice.toFixed(2)}</span>
                             {discount > 0 && (
                               <>
                                 <span className="text-xs text-slate-400 line-through">₹{med.price.toFixed(2)}</span>
                                 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                                   {discount}% OFF
                                 </span>
                               </>
                             )}
                           </div>
                           
                           {!med.inStock ? (
                             <Button variant="outline" disabled className="w-full h-9 rounded-md font-bold text-slate-400 border-slate-200 text-xs">
                                {t('medicines.outOfStock')}
                             </Button>
                           ) : qty > 0 ? (
                             <div className="flex items-center justify-between bg-[#FCEBE7] rounded-md p-0.5 border border-[#E8593C]/20">
                               <Button variant="ghost" size="icon"
                                 className="h-8 w-8 text-[#E8593C] hover:bg-white rounded-md"
                                 onClick={() => updateQuantity(med.id, qty - 1)}>
                                 <Minus className="h-3 w-3" />
                               </Button>
                               <span className="font-bold text-[#E8593C] text-sm min-w-[24px] text-center">{qty}</span>
                               <Button variant="ghost" size="icon"
                                 className="h-8 w-8 text-[#E8593C] hover:bg-white rounded-md"
                                 onClick={() => updateQuantity(med.id, qty + 1)}>
                                 <Plus className="h-3 w-3" />
                               </Button>
                             </div>
                           ) : (
                             <Button 
                               onClick={() => handleAdd(med)}
                               className="w-full rounded-md bg-[#0d5c3a] text-white hover:bg-[#0b5e39] font-bold text-sm h-9 transition-transform"
                             >
                               {t('medicines.addToCart')}
                             </Button>
                           )}
                         </div>
                       </div>
                     </div>
                   )
                 })
               ) : (
                 <div className="col-span-full py-16 text-center space-y-4 bg-white rounded-xl border border-dashed border-slate-300">
                   <div className="text-5xl mx-auto">📦</div>
                   <h3 className="font-heading text-xl font-bold text-slate-900">{t('medicines.noMedicinesTitle')}</h3>
                   <p className="text-slate-500 max-w-sm mx-auto text-sm">
                     {t('medicines.noMedicinesDesc')}
                   </p>
                   <Button onClick={clearFilters} className="bg-[#0d5c3a] hover:bg-[#0b5e39] text-white font-bold px-6">
                     {t('medicines.clearAll')}
                   </Button>
                 </div>
               )}
             </div>

             {/* Pagination */}
             {totalPages > 1 && (
               <div className="flex justify-center mt-10 gap-2 flex-wrap">
                 <Button variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                   className="rounded-md font-bold border-slate-300">Prev</Button>
                 {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                   <Button key={i} onClick={() => setPage(i)}
                     className={cn("rounded-md font-bold w-10", page === i
                       ? "bg-[#0d5c3a] text-white"
                       : "bg-white border-slate-300 text-slate-600 hover:border-[#0d5c3a] hover:text-[#0d5c3a]")}>
                     {i + 1}
                   </Button>
                 ))}
                 <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                   className="rounded-md font-bold border-slate-300">Next</Button>
               </div>
             )}
          </div>
        </div>
      </div>
{cartCount > 0 && (
        <Link href="/cart"
          className="fixed bottom-6 right-6 z-50 bg-[#E8593C] text-white rounded-xl px-5 py-3 shadow-xl hover:bg-[#c94a30] transition-all active:scale-95 flex items-center gap-3 font-bold">
          <ShoppingCart className="h-5 w-5" />
          <span>{cartCount} {cartCount > 1 ? t('medicines.cartItems') : t('medicines.item')}</span>
          <span className="bg-white text-[#E8593C] rounded px-2 py-0.5 text-xs">{t('medicines.view')}</span>
        </Link>
      )}

    </div>
  )
}