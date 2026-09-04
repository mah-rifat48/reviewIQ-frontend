# 💻 ReviewIQ — Frontend Web Application (`aimalya-frontend`)

The **ReviewIQ Frontend** is a modern, responsive web application built using **Next.js 16 (React 19)**, **TailwindCSS**, **Redux Toolkit (RTK Query)**, and **Recharts**.

---

## ⚡ Quick Start

### 1. Environment Configuration
Ensure `.env.local` exists in `aimalya-frontend/`:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_BASE_URL_AI=/api/ai
AI_API_URL=http://localhost:8000
```

### 2. Run Development Server
```powershell
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```powershell
npm run build
npm run start
```

---

## 📁 File Structure

```
app/
├── (user)/                         # Customer Dashboard Routes
│   ├── (main content)/
│   │   ├── dashboard/              # Overview metrics & sentiment charts
│   │   ├── review/                 # Customer review analysis table
│   │   ├── ai-insights/            # Strategic AI insights & recommendations
│   │   ├── competitors/            # Competitor benchmark radar & cards
│   │   ├── reports/                # Automated PDF / CSV report generator
│   │   ├── account-setup/          # Onboarding wizard (Google Places lookup & goals)
│   │   └── settings/               # Account & location settings
│   └── login / signup              # User authentication flows
│
├── (admin)/                        # Admin Management Routes
│   └── admin/                      # Users, subscriptions, analytics, tickets
│
components/                         # UI Components
│   ├── ui/                         # Base reusable UI elements
│   ├── user/                       # User dashboard cards & charts
│   └── admin/                      # Admin tables & modals
│
redux/                              # Global State Management
│   ├── store.ts                    # Redux Store Configuration
│   └── api/
│       ├── AI/                     # RTK Query slices connecting to AI service (Port 8000)
│       └── backend/                # RTK Query slices connecting to Main Backend (Port 3001)
```

---

## 🔄 Next.js API Proxy / Rewrites

In `next.config.ts`, requests to `/api/ai/:path*` are automatically proxied to `${AI_API_URL}/:path*` (`http://localhost:8000`), avoiding CORS issues and simplifying client-side API calls.
