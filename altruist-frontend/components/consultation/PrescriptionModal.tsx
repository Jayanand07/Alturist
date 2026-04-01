"use client"

import React, { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Plus, 
  Trash2, 
  Stethoscope, 
  Pill, 
  ClipboardCheck, 
  CalendarIcon, 
  AlertCircle,
  Loader2,
  X
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import api from "@/lib/axios"
import { cn } from "@/lib/utils"

const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  durationUnit: z.string().default("days"),
  instructions: z.string().optional(),
})

const prescriptionSchema = z.object({
  diagnosis: z.string().min(10, "Diagnosis must be at least 10 characters").max(1000),
  medicines: z.array(medicineSchema).min(1, "At least one medicine is required"),
  tests: z.array(z.string()).optional().default([]),
  customTest: z.string().optional(),
  followUp: z.boolean().default(false),
  followUpDate: z.string().optional(),
  validUntil: z.string().min(1, "Validity date is required"),
})

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>

interface PrescriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consultationId: string
}

const COMMON_TESTS = ["Blood Test (CBC)", "Sugar (Fasting/PP)", "Lipid Profile", "Urine Test", "X-Ray", "Ultrasound", "ECG"]

export default function PrescriptionModal({ 
  open, 
  onOpenChange, 
  consultationId
}: PrescriptionModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get default validity: 15 days from now
  const today = new Date()
  const defaultValidDate = new Date()
  defaultValidDate.setDate(today.getDate() + 15)
  const defaultValidString = defaultValidDate.toISOString().split("T")[0]

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      diagnosis: "",
      medicines: [{ name: "", dosage: "", frequency: "Twice daily", duration: "5", durationUnit: "days", instructions: "" }],
      tests: [],
      customTest: "",
      followUp: false,
      validUntil: defaultValidString,
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "medicines",
    control: form.control,
  })

  const onSubmit = async (values: PrescriptionFormValues) => {
    setIsSubmitting(true)
    try {
      const finalTests = [...values.tests]
      if (values.customTest?.trim()) {
        finalTests.push(values.customTest.trim())
      }

      const payload = {
        consultationId,
        diagnosis: values.diagnosis,
        medicines: values.medicines.map(m => ({
          ...m,
          duration: `${m.duration} ${m.durationUnit}`
        })),
        diagnosticTests: finalTests,
        followUpDate: values.followUp ? values.followUpDate : null,
        validUntil: values.validUntil,
      }

      await api.post("/prescriptions", payload)
      
      const displayDate = new Date().toLocaleDateString('en-IN')
      toast.success(`Prescription generated successfully at ${displayDate}`)
      onOpenChange(false)
      // Internal redirect after success
      router.push("/doctor/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate prescription")
    } finally {
      setIsSubmitting(false)
    }
  }

  const diagnosisLength = form.watch("diagnosis").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-[#0D9488] text-white p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6" /> Create Prescription
              </DialogTitle>
              <DialogDescription className="text-teal-50">
                Generating medical record for patient
              </DialogDescription>
            </div>
            <DialogClose className="rounded-full hover:bg-white/20 p-2 transition-colors">
              <X className="w-5 h-5" />
            </DialogClose>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
            
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900 border-b pb-2">
                <Stethoscope className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-lg font-bold">1. Clinical Diagnosis</h3>
              </div>
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Textarea 
                          placeholder="Enter patient diagnosis, clinical observations, and general recommendations..."
                          className="min-h-[120px] resize-none focus-visible:ring-[#0D9488] border-gray-200"
                          {...field} 
                        />
                        <div className={cn(
                          "absolute bottom-2 right-2 text-xs font-medium px-2 py-1 rounded-md bg-white/80",
                          diagnosisLength < 10 ? "text-amber-500" : "text-gray-400"
                        )}>
                          {diagnosisLength}/1000 characters
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2 text-gray-900 border-b pb-2">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-[#0D9488]" />
                  <h3 className="text-lg font-bold">2. Prescribed Medicines</h3>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ name: "", dosage: "", frequency: "Twice daily", duration: "5", durationUnit: "days", instructions: "" })}
                  className="border-[#0D9488] text-[#0D9488] hover:bg-teal-50 h-8 font-bold"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Medicine
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 space-y-4 relative animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <FormField
                          control={form.control}
                          name={`medicines.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-gray-500">Medicine Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Paracetamol" className="focus-visible:ring-[#0D9488]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`medicines.${index}.dosage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-gray-500">Dosage</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 500mg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`medicines.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-gray-500">Frequency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Once daily">Once daily</SelectItem>
                                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                                  <SelectItem value="Thrice daily">Thrice daily</SelectItem>
                                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                                  <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                                  <SelectItem value="As needed (SOS)">As needed (SOS)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4 flex gap-2 items-end">
                         <div className="flex-1">
                            <FormField
                              control={form.control}
                              name={`medicines.${index}.duration`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-bold uppercase text-gray-500">Duration</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                         </div>
                         <div className="w-24">
                            <FormField
                              control={form.control}
                              name={`medicines.${index}.durationUnit`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="days">Days</SelectItem>
                                      <SelectItem value="weeks">Weeks</SelectItem>
                                      <SelectItem value="months">Months</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                         </div>
                      </div>
                      <div className="md:col-span-7">
                        <FormField
                          control={form.control}
                          name={`medicines.${index}.instructions`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-gray-500">Instructions</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Before food, at bedtime" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end justify-center pb-2">
                        {fields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900 border-b pb-2">
                <ClipboardCheck className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-lg font-bold">3. Diagnostic Tests & Lab Work</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50/30 p-4 rounded-xl border border-gray-100">
                {COMMON_TESTS.map((test) => (
                  <FormField
                    key={test}
                    control={form.control}
                    name="tests"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(test)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, test])
                                : field.onChange(field.value?.filter((value: string) => value !== test))
                            }}
                            className="data-[state=checked]:bg-[#0D9488]"
                          />
                        </FormControl>
                        <FormLabel className="font-medium text-gray-700 cursor-pointer">{test}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
                <div className="col-span-full">
                   <FormField
                    control={form.control}
                    name="customTest"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Enter custom diagnostic test..." className="mt-2 text-sm border-gray-200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-gray-900 border-b pb-2">
                  <CalendarIcon className="w-5 h-5 text-[#0D9488]" />
                  <h3 className="text-lg font-bold">4. Follow-up Plan</h3>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="followUp"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-medium text-gray-700">Schedule follow-up consultation</FormLabel>
                      </FormItem>
                    )}
                  />
                  {form.watch("followUp") && (
                    <FormField
                      control={form.control}
                      name="followUpDate"
                      render={({ field }) => (
                        <FormItem className="animate-in fade-in slide-in-from-left-2">
                          <FormControl>
                            <Input 
                              type="date"
                              {...field}
                              className="focus-visible:ring-[#0D9488]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-gray-900 border-b pb-2">
                  <AlertCircle className="w-5 h-5 text-[#0D9488]" />
                  <h3 className="text-lg font-bold">5. Prescription Validity</h3>
                </div>
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                         <Input 
                          type="date"
                          {...field}
                          className="focus-visible:ring-[#0D9488]"
                        />
                      </FormControl>
                      <FormDescription>Standard validity is 15 days. Max 30 days recommended.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>
            </div>

            <DialogFooter className="pt-8 border-t flex items-center justify-between gap-4">
               <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="font-bold text-gray-500">
                  Cancel
               </Button>
               <Button 
                type="submit" 
                disabled={isSubmitting || diagnosisLength < 10}
                className="bg-[#0D9488] hover:bg-[#0b7a6e] text-white font-bold h-12 px-8 min-w-[200px] shadow-lg shadow-teal-100"
               >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Prescription"
                  )}
               </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
