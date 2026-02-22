# SkillSphere — Agent Instructions

## Project Overview
Multi-tenant school management platform with .NET 9 backend + Angular 19 frontend.

## Architecture
- **Backend:** Clean Architecture — API → Application → Infrastructure → Domain
- **Database:** SQLite (local file `src/SkillSphere.API/SkillSphere.db`), EF Core 9
- **Frontend:** Angular 19, standalone components, lazy-loaded routes
- **Auth:** JWT Bearer tokens, BCrypt password hashing

## Running the App

### Backend (API)
```bash
dotnet run --project "src/SkillSphere.API/SkillSphere.API.csproj" --urls "http://localhost:5000"
```
- Swagger: http://localhost:5000/swagger
- Auto-migrates DB + seeds data on startup

### Frontend (Angular)
```bash
cd client && npx ng serve
```
- App: http://localhost:4200
- Proxies API calls to http://localhost:5000/api

## Important Rules for Making Changes

### Before editing backend code:
1. **Stop the running API process first** — kill whatever is on port 5000
2. Make your code changes
3. Build: `dotnet build SkillSphere.sln`
4. **Restart the API** after successful build

### Stopping & restarting the backend:
```powershell
# Stop
Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }

# Wait then start
Start-Sleep -Seconds 2
dotnet run --project "src/SkillSphere.API/SkillSphere.API.csproj" --urls "http://localhost:5000"
```

### Frontend changes:
- Angular dev server hot-reloads automatically — no restart needed
- If the dev server stopped, restart: `cd client && npx ng serve`

### Always ensure both servers are running after any change:
- Port 4200 → Angular dev server
- Port 5000 → .NET API

## Test Credentials
All users: **Password: `Admin@123`**

| Role | Email |
|------|-------|
| Platform Super Admin | superadmin@skillsphere.com |
| School Admin | admin@alnoor.edu.sa |
| School Manager | manager@alnoor.edu.sa |
| Teacher | ahmed.teacher@alnoor.edu.sa |
| Supervisor | supervisor@alnoor.edu.sa |
| Student | ali.student@alnoor.edu.sa |
| Parent | parent.bakr@alnoor.edu.sa |

## Key File Locations
- **Domain Entities:** `src/SkillSphere.Domain/Entities/`
- **Service Interfaces:** `src/SkillSphere.Application/Interfaces/`
- **Service Implementations:** `src/SkillSphere.Infrastructure/Services/`
- **API Controllers:** `src/SkillSphere.API/Controllers/`
- **DB Context:** `src/SkillSphere.Infrastructure/Persistence/SkillSphereDbContext.cs`
- **DB Seeder:** `src/SkillSphere.Infrastructure/Persistence/DatabaseSeeder.cs`
- **Angular Services:** `client/src/app/core/services/data.service.ts`
- **Angular Models:** `client/src/app/core/models/`
- **Angular Components:** `client/src/app/features/`
- **Angular Routes:** `client/src/app/app.routes.ts`
