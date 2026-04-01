"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Search, ShoppingCart, Plus, Minus, AlertCircle, Pill } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"

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
  "General", "Antibiotics", "Pain Relief", "Diabetes", "Cardiac", "Skin Care", "Personal Care"
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

  const getItemQuantity = (id: string) => {
    return items.find((i) => i.id === id)?.quantity || 0
  }

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-8 mb-12 text-white text-center shadow-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Order Medicines Online</h1>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Get genuine medicines delivered to your doorstep within 24 hours. Safe, fast, and convenient.
        </p>
        <div className="flex max-w-md mx-auto relative">
          <Input
            type="text"
            placeholder="Search by name or generic name..."
            className="pl-12 py-6 text-slate-900 rounded-2xl w-full border-0 focus-visible:ring-2 focus-visible:ring-emerald-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-10 items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-2 min-w-[200px]">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</Label>
            <Select value={category} onValueChange={(v: string | null) => { if (v) { setCategory(v); setPage(0); } }}>
              <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3 ml-2 pt-6">
            <Switch
              checked={prescriptionFilter}
              onCheckedChange={(val) => { setPrescriptionFilter(val); setPage(0); }}
            />
            <Label htmlFor="prescription-mode" className="text-sm font-medium text-slate-700">Prescription Required</Label>
          </div>
        </div>

        <div className="text-sm font-medium text-slate-500">
          Showing <span className="text-teal-600 font-bold">{medicines.length}</span> medicines
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : medicines.length > 0 ? (
          medicines.map((med) => (
            <Card key={med.id} className="group hover:shadow-2xl transition-all duration-300 border-slate-100 overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="p-6 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100 mb-2">
                      {med.category}
                    </Badge>
                    {med.requiresPrescription && (
                      <Badge variant="destructive" className="flex gap-1 items-center px-2 py-1 text-[10px] uppercase tracking-tighter">
                        <AlertCircle className="h-3 w-3" /> Prescription Required
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors">
                    {med.name}
                  </CardTitle>
                  <p className="text-sm text-slate-400 italic">Generic: {med.genericName}</p>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <p className="text-sm text-slate-500 mb-4 font-medium">By {med.manufacturer}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">
                      ₹{med.discountedPrice ?? med.price}
                    </span>
                    {med.discountedPrice && (
                      <span className="text-sm text-slate-400 line-through">₹{med.price}</span>
                    )}
                  </div>
                </CardContent>
              </div>
              <CardFooter className="p-6 pt-2 bg-slate-50/50">
                {getItemQuantity(med.id) > 0 ? (
                  <div className="flex items-center justify-between w-full bg-white rounded-xl border border-teal-200 p-1 shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-teal-600 hover:bg-teal-50"
                      onClick={() => updateQuantity(med.id, getItemQuantity(med.id) - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-slate-800">{getItemQuantity(med.id)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-teal-600 hover:bg-teal-50"
                      onClick={() => updateQuantity(med.id, getItemQuantity(med.id) + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-6 shadow-md shadow-teal-100"
                    onClick={() => handleAddToCart(med)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">No Medicines Found</h3>
             <p className="text-slate-500">Try adjusting your search or filters.</p>
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
              className={`${page === idx ? "bg-teal-600" : "text-teal-600 border-teal-200"}`}
              onClick={() => setPage(idx)}
            >
              {idx + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
