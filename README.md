# 🩺 Altruist — Modern Medical Consultation Platform

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blueviolet.svg)](https://supabase.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-yellow.svg)](https://firebase.google.com/)

Altruist is a high-performance, **HIPAA-compliant** medical consultation platform designed to bridge the gap between patients and healthcare professionals. Built with a focus on security, scalability, and premium user experience.

---

## 🚀 Key Features

- **🔒 Advanced Security**: HIPAA-compliant architecture with Supabase Row Level Security (RLS) and custom JWT authentication.
- **👨‍⚕️ Specialist Dashboards**: Dedicated interfaces for Doctors (consultation management, digital prescriptions) and Patients (booking, medical history).
- **📝 Smart Prescriptions**: Automated PDF generation for medical prescriptions using iText 7.
- **💊 Medicine Directory**: Robust search and management for a comprehensive medicine database.
- **💳 Integrated Orders**: Seamless order placement for medical services and prescriptions with real-time status tracking.
- **🔐 Multi-Role Access**: Fine-grained role-based access control (RBAC) for Admin, Doctor, and Patient roles.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) / [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Language**: TypeScript

### Backend
- **Framework**: [Spring Boot 3.2](https://spring.io/projects/spring-boot)
- **Security**: Spring Security + Firebase Admin SDK
- **Data**: Spring Data JPA + PostgreSQL
- **PDF Engine**: iText 7
- **Language**: Java 17

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Auth
- **Environment**: Dotenv for secure configuration

---

## 📂 Project Structure

```text
.
├── altruist-frontend/     # Next.js 14 Frontend application
│   ├── app/               # App Router pages and layouts
│   ├── components/        # Reusable UI components
│   └── lib/               # Utility functions and shared logic
├── src/main/java/         # Spring Boot Backend source code
│   ├── controller/        # REST Endpoints
│   ├── model/             # JPA Entities & Domain Models
│   ├── repository/        # Data Access Layer
│   └── service/           # Business Logic
├── supabase/              # Database migrations and RLS policies
├── pom.xml                # Backend dependencies (Maven)
└── package.json           # Root package configuration
```

---

## 🚦 Getting Started

### Prerequisites
- **Java 17** and **Maven**
- **Node.js 18+** and **npm**
- **Supabase Account**
- **Firebase Project**

### 1. Backend Setup
1. Clone the repository.
2. Create a `.env` file in the root directory (refer to `.env.example`).
3. Add your Firebase Service Account JSON to the root.
4. Run the backend:
   ```bash
   mvn spring-boot:run
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd altruist-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your API and Auth keys.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🛡 Security & Compliance

This platform implements industry-standard security measures:
- **HIPAA Compliance**: No raw PII exposure in logs; encrypted data storage.
- **RLS Policies**: Data access is strictly controlled at the database level via Supabase.
- **Input Validation**: Strict sanitization and parameterized queries to prevent SQL injection and XSS.
- **Audit Logs**: All sensitive operations are tracked and verified.

---

## 📄 License

Internal Project - All Rights Reserved.
