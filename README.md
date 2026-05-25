# 🩺 Altruist Wellness — Premium Medical Telemedicine Platform

[![Java](https://img.shields.io/badge/Java-17-orange.svg?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-brightgreen.svg?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blueviolet.svg?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-yellow.svg?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)

Altruist Wellness is a premium, high-performance, **HIPAA-compliant** medical telemedicine platform. It bridges the gap between patient care and verified medical experts by offering instant online consultations, genuine medicine delivery, diagnostic lab tests, and secure electronic prescriptions. 

---

## 🌟 Key Features

*   **🔒 Strict HIPAA-Compliant Security**: Secure data structures utilizing Supabase Row-Level Security (RLS) and custom HMAC-SHA256 JWT tokens.
*   **🩺 Comprehensive Telemedicine Portal**: Digital-first online doctor consulting, matching clients with top specialists across multiple branches (Cardiology, Pediatrics, Dermatology, etc.).
*   **🧪 Diagnostic Lab packages**: Direct-to-home hygienic blood/urine sample collection packages with automated report access.
*   **💊 express Medicine delivery**: Genuine medicine inventory and express prescription preparation with a fast, modern digital checkout cart.
*   **📊 Specialist Dashboards**:
    *   **Patient Cockpit**: consultation bookings, active prescription downloads, health plan status, and secure ticketing.
    *   **Doctor Panel**: instant consultation queues, detailed patient history mapping, earnings visualization, and virtual consultation rooms.
    *   **System Control Center (Admin)**: total doctors/patients stats, live system billing tracking, clinic listings, and complete account management.
*   **💬 Real-Time Consultations**: Fully secured real-time chat consultation rooms syncing Firebase UID credentials to custom backend permissions.

---

## 🏗️ Architecture & Tech Stack

```text
               ┌────────────────────────────────────────────────────────┐
               │                  NEXT.JS 14 FRONTEND                   │
               │         (React, Tailwind CSS, TanStack Query)          │
               └───────────┬────────────────────────────────┬───────────┘
                           │                                │
                 Firebase Auth Token                 Secure API Calls
                           │                                │
                           ▼                                ▼
               ┌───────────────────────┐        ┌───────────────────────┐
               │    FIREBASE AUTH      │        │  SPRING BOOT BACKEND  │
               │ (Client Verification) │        │   (Java 17 REST API)  │
               └───────────────────────┘        └───────────┬───────────┘
                                                            │
                                                     JDBC Connection
                                                            │
                                                            ▼
                                                ┌───────────────────────┐
                                                │   SUPABASE DATABASE   │
                                                │ (PostgreSQL + RLS)    │
                                                └───────────────────────┘
```

### Frontend Component
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Vanilla CSS + Tailwind CSS (elegant typography, glassmorphism, tailored HSL color palettes)
*   **State Management**: Zustand (Cart), TanStack Query (Server State)
*   **Language**: TypeScript

### Backend Component
*   **Framework**: Spring Boot 3.2.5
*   **Security**: Spring Security 6 + Firebase Admin SDK Filter
*   **Data Access**: Spring Data JPA + Hibernate ORM
*   **Database Pool**: HikariCP (Connection Pool optimized for high-concurrency production instances)
*   **Language**: Java 17 (OpenJDK)

### Database & Auth Providers
*   **Database**: Supabase PostgreSQL (secured via migrations revoking direct anonymous table and GraphQL schemas accesses)
*   **Authentication**: Firebase Admin OIDC token validation

---

## 📂 Project Structure

```text
├── altruist-frontend/        # Next.js 14 Frontend Application
│   ├── app/                  # Next.js App Router (dashboard, checkout, consult routes)
│   ├── components/           # Reusable UI component library (headers, footers, carts)
│   ├── context/              # Auth, Language (5-language support) Context Providers
│   ├── lib/                  # Shared utility methods, Axios client, and translations
│   └── store/                # Client state stores (Cart, Location selectors)
├── src/main/java/            # Spring Boot Backend Engine
│   └── com/altruist/
│       ├── config/           # Security, Firebase, CORS configurations
│       ├── controller/       # REST Endpoints (Consultations, Support, Doctors)
│       ├── dto/              # Strongly typed Data Transfer Objects
│       ├── model/            # JPA Domain Entities
│       ├── repository/       # Hibernate Database Access
│       └── service/          # Core Business Logic implementation
├── supabase/                 # Database migrations and SQL security scripts
├── pom.xml                   # Maven Backend Dependency Management
└── README.md                 # Project Documentation
```

---

## 🚦 Local Setup & Installation

### Prerequisites
*   **Java Development Kit (JDK 17)** installed
*   **Node.js 18+** & **npm** installed
*   **Maven 3.8+** installed
*   A running **Supabase** instance and a **Firebase** project

### 1. Database Setup
1. Execute the tables schema in your Supabase SQL Editor.
2. Open the file [supabase_rls_migration.sql](file:///c:/Users/anand/Desktop/medical%20pr/supabase_rls_migration.sql) from the project root.
3. Run the commands in your SQL Editor to enforce Row Level Security (RLS) across all public tables, securing them from direct PostgREST or anonymous GraphQL discovery.

### 2. Backend Config
1. Create a `.env` file in the root workspace (see `.env.example`).
2. Add your environment variables:
   ```env
   DATABASE_URL=jdbc:postgresql://<host>:<port>/postgres
   DATABASE_USERNAME=postgres.<project-id>
   DATABASE_PASSWORD=<your-db-password>
   FIREBASE_CREDENTIALS_PATH=C:/path/to/firebase-service-account.json
   SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>
   ```
3. Run compilation and start:
   ```bash
   mvn clean package -DskipTests
   mvn spring-boot:run
   ```

### 3. Frontend Config
1. Navigate to the frontend directory:
   ```bash
   cd altruist-frontend
   ```
2. Install the production dependencies:
   ```bash
   npm install
   ```
3. Add a `.env.local` containing:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXT_PUBLIC_SUPABASE_URL=https://<id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
   NEXT_PUBLIC_FIREBASE_API_KEY=<key>
   ```
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```

---

## 🚀 Production Deployment Guide

For complete, highly detailed production configurations on **Vercel** (Frontend), **Render** (Backend), **Firebase OAuth**, and **Custom Domains**, refer to the comprehensive walkthrough guide:

👉 **[Production Walkthrough & Deployment Guide](file:///C:/Users/anand/.gemini/antigravity-ide/brain/22486c73-4303-401a-989b-60deafcb0997/walkthrough.md)**

---

## 🛡️ Security & HIPAA Policy

*   **No Sensitive Logs**: Zero stack traces or PII data (e.g., patient names, phone numbers) are logged server-side.
*   **Input Sanitization**: Strong validation bounds using `jakarta.validation` to prevent parameter injection.
*   **Role Protection**: Secured role routing ensuring patient, doctor, and admin spaces are fully segregated and authenticated.
