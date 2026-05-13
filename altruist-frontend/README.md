# 🏥 Altruist Frontend — Patient & Doctor Portal

This is the Next.js 14 frontend for the **Altruist** medical platform. It provides a secure, responsive, and intuitive interface for patients and healthcare professionals.

## ✨ Features

- **🔐 Secure Auth**: Integrated with Firebase Authentication.
- **🎨 Premium UI**: Built with Tailwind CSS and Shadcn UI components.
- **📱 Responsive Design**: Optimized for both desktop and mobile medical consultations.
- **⚡ Performance**: Leverages Next.js 14 App Router and Server Components for optimal speed.
- **🔄 Real-time Updates**: Interactive dashboards for tracking consultations and orders.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **State Management**: React Context & Hooks
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file in this directory and add the following:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 3. Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Key Directories

- `/app`: Main application routes and layouts.
- `/components`: Reusable UI components (buttons, inputs, modals).
- `/context`: Authentication and global state providers.
- `/lib`: API client and shared utilities.
- `/store`: State management logic.
- `/types`: TypeScript interfaces and types.

---

Part of the [Altruist](..) platform.

