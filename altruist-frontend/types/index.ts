// ── User ─────────────────────────────────────────────────────────────────────

export type UserType = "PATIENT" | "DOCTOR" | "ADMIN";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  phone: string;
  fullName: string;
  dateOfBirth: string; // ISO date string
  gender: Gender;
  profilePictureUrl?: string;
  userType: UserType;
  createdAt: string;
  updatedAt: string;
}

// ── Doctor ────────────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  user: User;
  specialization: string;
  medicalLicense: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  isAvailable: boolean;
  rating: number;
  totalConsultations: number;
  createdAt: string;
}

// ── Consultation ──────────────────────────────────────────────────────────────

export type ConsultationType = "INSTANT" | "SCHEDULED";
export type ConsultationStatus = "PENDING" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Consultation {
  id: string;
  patient: User;
  doctor: Doctor;
  scheduledAt: string;
  consultationType: ConsultationType;
  status: ConsultationStatus;
  videoRoomId?: string;
  prescriptionUrl?: string;
  diagnosis?: string;
  amount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

// ── Prescription ──────────────────────────────────────────────────────────────

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface DiagnosticTest {
  name: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patient: User;
  doctor: Doctor;
  medicines: Medicine[];
  diagnosticTests: DiagnosticTest[];
  notes?: string;
  validUntil: string;
  createdAt: string;
}

// ── API Utils ─────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
