# Vaeto CRM Backend (Java 17 + Spring Boot 3 + MySQL)

Enterprise CRM REST API service for Vaeto Technology Lead Management Dashboard.

---

## 1. Prerequisites

- **Java Development Kit (JDK):** Version 17 or higher
- **Apache Maven:** 3.8+ (or use installed Maven)
- **MySQL Database:** 8.0+ (or TiDB Cloud)
- **MySQL Database Name:** `vaeto_lead_management`

---

## 2. Environment Configuration

Copy `.env.example` or set your environment variables:

| Variable | Description | Default / Example |
|---|---|---|
| `DB_URL` | JDBC URL for MySQL | `jdbc:mysql://localhost:3306/vaeto_lead_management?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | *your_mysql_password* |
| `SERVER_PORT` | HTTP port for Spring Boot | `8080` |
| `JWT_SECRET` | 256-bit secret key | *Base64 or 32+ character key* |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin | `http://localhost:5173` |

---

## 3. Build & Run Instructions

From the `backend/` directory:

### Step 1: Compile and package
```bash
mvn clean package -DskipTests
```

### Step 2: Run with environment variables (PowerShell example)
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/vaeto_lead_management?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_actual_password"
$env:SERVER_PORT="8080"
mvn spring-boot:run
```

Or run the compiled JAR directly:
```powershell
java -jar target/crm-backend-1.0.0.jar
```

---

## 4. API Endpoints Overview

All APIs are prefixed with `/api/v1`:

### Authentication & Profiles
- `GET /api/v1/health` — Service health check (Public)
- `POST /api/v1/auth/login` — User login; returns JWT token and user profile
- `POST /api/v1/auth/register` — User registration
- `GET /api/v1/auth/me` — Get authenticated user details (Bearer Token)
- `POST /api/v1/auth/change-password` — Change password (Bearer Token)
- `POST /api/v1/auth/logout` — Revoke session & clear context

### Dashboard & Analytics
- `GET /api/v1/dashboard/stats` — 5 KPI card totals with historical trends
- `GET /api/v1/dashboard/lead-status` — Aggregated counts for the Lead Status doughnut chart
- `GET /api/v1/dashboard/upcoming-followups` — List of due upcoming follow-ups
- `GET /api/v1/reports` — Pipeline conversion metrics

### Leads Management
- `GET /api/v1/leads` — Paginated lead query with filters (`search`, `status`, `source`)
- `GET /api/v1/leads/{id}` — Get single lead
- `POST /api/v1/leads` — Create lead
- `PUT /api/v1/leads/{id}` — Update lead
- `DELETE /api/v1/leads/{id}` — **ADMIN ONLY** (Regular users receive HTTP 403 Forbidden)
- `GET /api/v1/leads/export` — Download CSV export

### Tasks Management
- `GET /api/v1/tasks` — List tasks
- `POST /api/v1/tasks` — Create task
- `PUT /api/v1/tasks/{id}` — Update task
- `PATCH /api/v1/tasks/{id}/status` — Toggle / update status
- `DELETE /api/v1/tasks/{id}` — Delete task

### Follow-ups Management
- `GET /api/v1/follow-ups` — List follow-ups
- `POST /api/v1/follow-ups` — Schedule follow-up
- `PUT /api/v1/follow-ups/{id}` — Update follow-up
- `PATCH /api/v1/follow-ups/{id}/complete` — Mark completed
- `DELETE /api/v1/follow-ups/{id}` — Delete follow-up

### Meetings & Calendar
- `GET /api/v1/meetings` — Calendar date range query
- `POST /api/v1/meetings` — Schedule meeting
- `PUT /api/v1/meetings/{id}` — Update meeting
- `DELETE /api/v1/meetings/{id}` — Cancel meeting

### Administration (**ADMIN ROLE ONLY**)
- `GET /api/v1/admin/users` — Full user directory
- `POST /api/v1/admin/users` — Admin user creation
- `PUT /api/v1/admin/users/{id}` — Update user role/details
- `PATCH /api/v1/admin/users/{id}/status` — Activate/Deactivate user
- `GET /api/v1/admin/audit-logs` — Audit log trail
