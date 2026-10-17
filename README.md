# VaetoTech CRM Frontend

A complete, responsive frontend for the **VaetoTech Lead Management CRM application**, crafted with pixel-accurate adherence to the three reference designs (Login Page, User Dashboard, Admin Dashboard).

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build & Typecheck
```bash
npm run typecheck
npm run build
npm run preview
```

---

## 🔑 Demo Login Accounts

The application includes interactive 1-click credential fill buttons on the login page:

| Role | Email | Password | Permissions & Views |
| :--- | :--- | :--- | :--- |
| **Standard User** | `dinesh@vaetotech.com` | `Demo@123` | User Dashboard, Lead View, Follow-ups, Calendar, My Tasks, Reports |
| **Administrator** | `admin@vaetotech.com` | `Admin@123` | Admin Dashboard with Delete capabilities, User Management, Roles & Permissions, System Settings |

---

## 🛠️ Technology Stack

- **React 18** with **TypeScript** (strict mode)
- **Vite** for rapid bundling
- **Tailwind CSS** with custom lavender backgrounds, modern soft shadows, and gradient tokens
- **React Router v6** with nested layouts and route-level authorization guards
- **Lucide React** for clean icon set
- **Recharts** for Donut status charts, sparkline trends, and pipeline analytics

---

## 📁 Architecture Overview

```
src/
├── components/
│   ├── brand/       # Reusable text-based Vaeto Logo & gradient V mark
│   ├── dashboard/   # StatCard (with sparklines), WelcomeBanner, LeadStatusChart (donut), UpcomingFollowUps
│   ├── layout/      # AppLayout, AuthLayout, Sidebar (collapsible & mobile drawer), Header (search, notifications, theme)
│   ├── leads/       # LeadTable (11 columns matching reference), LeadForm
│   └── ui/          # Button, Input, Select, Textarea, Checkbox, Toggle, Modal, ConfirmDialog, Pagination, Badges
├── context/
│   ├── AuthContext.tsx        # Client demo auth, roles, inactivity timeouts, reset link handling
│   ├── DataContext.tsx        # Full CRUD persistence in localStorage for leads, meetings, follow-ups, users
│   ├── PreferencesContext.tsx # User UI settings (compact tables, panel visibility)
│   ├── ThemeContext.tsx       # Dark/Light/System theme toggle
│   └── ToastContext.tsx       # Global toast notification dispatch
├── data/
│   └── sampleData.ts          # Realistic seeded demo leads matching reference images
├── hooks/                     # Custom hooks: useLocalStorage, useDebounce, useClickOutside, useNow
├── pages/
│   ├── auth/                  # Login, ForgotPassword, ResetPassword
│   ├── leads/                 # ManageLeads, AddLead, EditLead, LeadDetails
│   ├── account/               # Profile, ChangePassword, Notifications, Settings
│   ├── admin/                 # UserManagement, RolesPermissions, SystemSettings
│   ├── Dashboard.tsx          # Dual user/admin dashboard matching references
│   ├── Tasks.tsx              # My Tasks board
│   ├── FollowUps.tsx          # Follow-up schedule management
│   ├── ScheduleMeeting.tsx    # Book demos and client meetings
│   ├── Calendar.tsx           # Monthly schedule matrix
│   └── Reports.tsx            # Deal and pipeline conversion analytics
└── utils/                     # Date formatters, currency, validators, storage helpers
```

---

## ⚙️ Backend Integration Guide: What Uses Demo Data vs. Real Backend

| Feature | Current Frontend Implementation | Required Backend API |
| :--- | :--- | :--- |
| **Authentication & Sessions** | In-browser demo validation with plain-text demo passwords in `localStorage`. | `POST /api/auth/login`, HTTP-only session cookies or JWT, bcrypt password hashing. |
| **Password Recovery** | Generates temporary token stored in `localStorage` with on-screen demo link. | `POST /api/auth/forgot-password` (SMTP mail dispatch) & `POST /api/auth/reset-password`. |
| **Lead Management** | Full CRUD stored in browser `localStorage`. Real-time donut chart and stat recalculation. | REST endpoints: `GET/POST/PUT/DELETE /api/leads`. |
| **Activity Audit Trail** | Timestamped logs stored on the lead record. | Event-driven audit table `lead_activities`. |
| **Access Control (RBAC)** | Role permissions evaluated client-side via `AuthContext.can(permission)`. | Server-side middleware verifying token permissions before executing queries. |
| **Notifications** | Pre-seeded alerts stored in `localStorage`. | WebSocket or Server-Sent Events (SSE) dispatching live updates. |
