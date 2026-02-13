# SkillSphere — Multi-Tenant School Management Platform

## Tech Stack

- **Backend:** .NET 9, Clean Architecture, EF Core 9, PostgreSQL
- **Frontend:** Angular 19, TypeScript, SCSS
- **Auth:** JWT (Bearer tokens), BCrypt password hashing

## Getting Started

### Prerequisites

- .NET 9 SDK
- Node.js 18+
- PostgreSQL
- Angular CLI (`npm install -g @angular/cli`)

### Backend

```bash
cd src/SkillSphere.API
dotnet run
```

The database is automatically migrated and seeded on first startup.

API: `https://localhost:5001` | Swagger: `https://localhost:5001/swagger`

### Frontend

```bash
cd client
npm install
ng serve
```

App: `http://localhost:4200`

---

## Seeded Users & Credentials

All seeded users share the same password:

> **Password: `Admin@123`**

### Platform Level

| Role | Email | Name |
|------|-------|------|
| Platform Super Admin | `superadmin@skillsphere.com` | Platform Admin |

### School: Al-Noor International Academy

| Role | Email | Name |
|------|-------|------|
| School Admin | `admin@alnoor.edu.sa` | Khalid Al-Farsi |
| School Manager | `manager@alnoor.edu.sa` | Sara Al-Qahtani |

### Teachers

| Email | Name | Specialization |
|-------|------|----------------|
| `ahmed.teacher@alnoor.edu.sa` | Ahmed Hassan | Mathematics |
| `fatima.teacher@alnoor.edu.sa` | Fatima Al-Rashid | Science |
| `omar.teacher@alnoor.edu.sa` | Omar Mahmoud | Arabic & Islamic Studies |
| `noor.teacher@alnoor.edu.sa` | Noor Al-Sayed | English & Computer Science |

### Teacher Supervisor

| Email | Name | Specialization |
|-------|------|----------------|
| `supervisor@alnoor.edu.sa` | Yusuf Al-Mansoor | Science Department Head |

### Students

| Email | Name | Student # | Grade/Class |
|-------|------|-----------|-------------|
| `ali.student@alnoor.edu.sa` | Ali Al-Bakr | STU-2025-001 | 9A |
| `layla.student@alnoor.edu.sa` | Layla Hassan | STU-2025-002 | 9A |
| `sami.student@alnoor.edu.sa` | Sami Al-Zahrani | STU-2025-003 | 9B |
| `reem.student@alnoor.edu.sa` | Reem Khaled | STU-2025-004 | 10A |
| `mohammed.student@alnoor.edu.sa` | Mohammed Ibrahim | STU-2025-005 | 10B |
| `hana.student@alnoor.edu.sa` | Hana Al-Otaibi | STU-2025-006 | 11A |

### Parents

| Email | Name | Relationship | Children |
|-------|------|-------------|----------|
| `parent.bakr@alnoor.edu.sa` | Abdullah Al-Bakr | Father | Ali Al-Bakr |
| `parent.hassan@alnoor.edu.sa` | Mariam Hassan | Mother | Layla Hassan |
| `parent.khaled@alnoor.edu.sa` | Tariq Khaled | Father | Reem Khaled, Sami Al-Zahrani |

---

## Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@alnoor.edu.sa",
  "password": "Admin@123"
}
```
