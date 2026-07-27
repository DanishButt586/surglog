<div align="center">

# 🏥 SurgLog — Surgical Case Logbook & Tracker

**The modern digital logbook for surgical trainees, residents, and program directors.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E?logo=supabase)](https://supabase.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Assistant-4285F4?logo=google)](https://ai.google.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

[Live Demo](#) · [Features](#-features) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started)

</div>

---

## 📋 The Problem

Surgical trainees and residents are required to log every operative case they participate in throughout their training. These logs are audited by accreditation bodies (ACGME, Royal College of Surgeons) and reviewed by program directors and supervising consultants.

**Current pain points:**
- Paper logbooks are easily lost, hard to search, and impossible to analyze
- Existing digital solutions lack AI-powered study tools
- Program directors have no centralized way to audit trainee progress
- There's no built-in mechanism for consultants to approve or give feedback on logged cases

## 💡 The Solution

**SurgLog** is a full-stack web application that replaces paper surgical logbooks with a modern, intelligent platform. It serves two user types:

1. **Surgical Trainees** — Log cases, track procedure targets, analyze trends, and study with an AI assistant
2. **Program Directors / Consultants** — Audit trainee logbooks, approve cases, and leave feedback comments

---

## ✨ Features

### For Trainees
- **📝 Case Logging** — Log procedures with date, category, role (Performed/Assisted/Observed), supervisor, hospital, complexity, patient demographics, and notes
- **🎯 Target Tracking** — Set required case counts per procedure category (ACGME/RCS standards) with visual progress bars
- **📊 Analytics Dashboard** — 12-month trend charts, category distribution bar charts, and surgical role autonomy doughnut charts (powered by Recharts)
- **📤 Export** — Download your logbook as CSV or generate a formatted Board/Audit PDF report
- **🤖 AI Study Assistant** — Chat with Gemini AI to generate viva questions, reflective notes, and study surgical concepts
- **🌗 Dark/Light Mode** — Full theme support with system-aware toggle

### For Admins (Program Directors / Consultants)
- **🔒 Admin Panel** (`/admin`) — Restricted to users with `is_admin = true`
- **👥 Trainee Directory** — View all registered trainees with case counts and last activity
- **📋 Case Audit** — Inspect any trainee's full operative logbook with filters (role, date range, search)
- **✅ Case Approval** — Set case status: `Pending` → `Approved` → `Needs Review`
- **💬 Consultant Feedback** — Leave written comments on individual cases
- **🏷️ Status Badges** — Colored badges visible to trainees (🟡 Pending, 🟢 Approved, 🔴 Needs Review)

---

## 🤖 AI Study Assistant

The built-in AI chatbot uses the **Google Gemini API** with the following system prompt:

> *"You are the Logbook Assistant inside SurgLog, a surgical case-logging app for surgical students/residents. Your job is to help students study and reflect on cases they have already logged — NOT to give real clinical or diagnostic advice for actual patients. You can: (1) help draft a reflective learning note about a specific logged case when the student shares its details (procedure, role, complexity, notes), (2) generate likely viva/exam-style questions related to a procedure the student logged, (3) explain general surgical concepts and terminology for study purposes, and (4) give plain guidance on how to fill the logbook well. Always keep a supportive, professional, tutor-like tone. If a student describes a real, current patient situation needing clinical judgment, do not give diagnostic or treatment advice — tell them to consult their supervising surgeon/consultant immediately. Never claim certainty about clinical outcomes. Keep responses concise and structured, using short headers or bullet points where helpful."*

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Authentication** | Supabase Auth (email/password) |
| **Database** | Supabase PostgreSQL with Row Level Security |
| **AI** | Google Gemini API (Flash models) |
| **Charts** | Recharts |
| **PDF Export** | jsPDF + jspdf-autotable |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 📸 Screenshots

> *Screenshots will be added here*

| Dashboard | Case Logbook | Analytics |
|:---:|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![Cases](screenshots/cases.png) | ![Analytics](screenshots/analytics.png) |

| AI Assistant | Admin Panel | Login |
|:---:|:---:|:---:|
| ![AI](screenshots/ai-assistant.png) | ![Admin](screenshots/admin.png) | ![Login](screenshots/login.png) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key for Gemini

### 1. Clone the repository
```bash
git clone https://github.com/DanishButt586/surglog.git
cd surglog
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Set up the database
Run the SQL from [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor to create the required tables (`profiles`, `cases`, `targets`), functions, and Row Level Security policies.

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. (Optional) Promote an admin account
After creating a user account, run this SQL in Supabase to grant admin access:
```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

Or use the built-in admin shortcut on the login page: **Username: `admin`** / **Password: `admin`**

---

## 📁 Project Structure

```
surglog/
├── app/
│   ├── (dashboard)/          # Authenticated dashboard pages
│   │   ├── admin/            # Admin audit panel
│   │   ├── ai-assistant/     # AI chatbot page
│   │   ├── analytics/        # Charts & analytics
│   │   ├── cases/            # Case list, new, edit
│   │   ├── dashboard/        # Main dashboard
│   │   └── targets/          # Target settings
│   ├── api/chat/             # Gemini API route
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   └── page.tsx              # Landing page
├── components/               # Reusable UI components
├── lib/                      # Utilities, Supabase clients, exports
├── supabase/                 # Database schema & migrations
└── proxy.ts                  # Next.js 16 middleware (auth + admin gate)
```

---

## 📄 License

This project was built as a submission for ACT AI. All rights reserved.
