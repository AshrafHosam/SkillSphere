# SkillSphere — Timetable-Centered Redesign

> **Design Document — March 4, 2026**
> Implementation-ready specification. All entity fields, validation rules, service interfaces, and API contracts are final.

---

## 1. Design Overview

The system is re-centered around **Academic Integrity**: every student group must receive its full curriculum without resource conflicts. The **Draft → Publish** workflow is the core gate — a timetable cannot become active until it satisfies all business rules.

### Core Principle: The Timetable Is the Source of Truth

> A published timetable entry **IS** the teaching assignment. There is no separate "TeacherAssignment" entity.
> When a teacher needs to know "what do I teach today?", the answer comes from the published timetable.
> Attendance, grade records, and weekly reports all reference subject + group context that is derived from timetable entries.

### The Atomic Unit

Every scheduled slot binds exactly four resources:

```
TimetableEntry = Subject + Teacher + Room + Timeslot(Day + Period)
```

All four are **required** (non-nullable). An entry cannot exist without all four.

---

## 2. What Changes

### Summary

| Change Type | Items |
|-------------|-------|
| **New Entities** | Room, PeriodDefinition, CurriculumContract, TeacherSubjectLink |
| **New Enums** | RoomType |
| **Renamed** | ClassSection → Group |
| **Modified** | Subject, TeacherProfile, SchoolTenant, TimetableVersion, TimetableEntry, StudentAssignment, SupervisorScope, AttendanceRecord |
| **Removed** | TeacherAssignment (replaced by timetable entries + TeacherSubjectLink) |
| **Repurposed** | DayOfWeekFlag (now used for SchoolTenant.WorkingDays) |
| **Unchanged** | ApplicationUser, FeatureFlag, Department, Grade, Semester, ParentProfile, ParentLink, GradeRecord, BehaviorFeedback, PerformanceAttributeDefinition, WeeklyReport, WeeklyReportItem, InternalReport, InternalReportComment, NotificationEvent, AuditLog |

---

## 3. New Entities

### 3.1 PeriodDefinition (TenantEntity)

Defines the school's daily period structure. Periods are **day-agnostic** — Period 1 is 8:00–8:45 every school day.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| PeriodNumber | int | Required | 1-based ordering |
| Label | string | Required, max 50 | "Period 1", "Break", "Period 5" |
| StartTime | TimeSpan | Required | e.g., 08:00 |
| EndTime | TimeSpan | Required | e.g., 08:45. Must be > StartTime |
| IsBreak | bool | Default false | If true, this slot is not schedulable |
| IsActive | bool | Default true | Soft toggle |

**Business Rules:**
- Period times must not overlap within the same tenant
- Break periods cannot be referenced by TimetableEntry
- Typical school: 7–8 periods + 1–2 breaks

**Example Seed:**

| # | Label | Start | End | Break? |
|---|-------|-------|-----|--------|
| 1 | Period 1 | 07:30 | 08:15 | No |
| 2 | Period 2 | 08:20 | 09:05 | No |
| 3 | Break | 09:05 | 09:25 | Yes |
| 4 | Period 3 | 09:25 | 10:10 | No |
| 5 | Period 4 | 10:15 | 11:00 | No |
| 6 | Period 5 | 11:05 | 11:50 | No |
| 7 | Break | 11:50 | 12:20 | Yes |
| 8 | Period 6 | 12:20 | 13:05 | No |
| 9 | Period 7 | 13:10 | 13:55 | No |

---

### 3.2 Room (TenantEntity)

Physical rooms/spaces with type classification and capacity.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| Name | string | Required, max 100 | "Room 101", "Science Lab A" |
| Code | string | Required, max 20, unique per tenant | "R101", "LAB-A" |
| RoomType | RoomType (enum) | Required | Classroom, ScienceLab, etc. |
| Capacity | int | Required, > 0 | Physical seat count |
| Building | string? | Optional, max 100 | "Main Building" |
| Floor | int? | Optional | Floor number |
| IsActive | bool | Default true | |

**Nav Properties:** TimetableEntries (collection)

---

### 3.3 CurriculumContract (TenantEntity)

The "contract" specifying how many periods per week each subject requires for a given grade + semester. **This is the fulfillment target that must be met before a timetable can be published.**

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| GradeId | Guid | FK → Grade, required | |
| SemesterId | Guid | FK → Semester, required | |
| SubjectId | Guid | FK → Subject, required | |
| PeriodsPerWeek | int | Required, > 0 | e.g., 5 for Math |

**Unique Constraint:** (SchoolTenantId, GradeId, SemesterId, SubjectId)

**Nav Properties:** Grade, Semester, Subject

**Example:**

| Grade | Subject | Periods/Week |
|-------|---------|:------------:|
| Grade 9 | Mathematics | 5 |
| Grade 9 | Physics | 3 |
| Grade 9 | Arabic | 5 |
| Grade 9 | English | 4 |
| Grade 9 | Quran Studies | 2 |
| Grade 9 | Computer Science | 2 |
| Grade 10 | Mathematics | 5 |
| Grade 10 | Physics | 4 |
| Grade 10 | Chemistry | 3 |
| ... | ... | ... |

---

### 3.4 TeacherSubjectLink (TenantEntity)

Defines what a teacher is **qualified/authorized to teach**. This is a capability declaration, not a schedule.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| TeacherProfileId | Guid | FK → TeacherProfile, required | |
| SubjectId | Guid | FK → Subject, required | |
| GradeId | Guid? | FK → Grade, nullable | null = qualified for all grades |
| IsActive | bool | Default true | |

**Unique Constraint:** (SchoolTenantId, TeacherProfileId, SubjectId, GradeId)

**Business Rules:**
- A timetable entry can only assign a teacher to a subject if a matching TeacherSubjectLink exists
- If GradeId is set, the teacher can only teach that subject for that specific grade
- If GradeId is null, the teacher can teach that subject for any grade

**Example:**

| Teacher | Subject | Grade Restriction |
|---------|---------|:-----------------:|
| Ahmed | Mathematics | (any) |
| Fatima | Physics | Grade 10, 11 |
| Fatima | Chemistry | Grade 11 |
| Omar | Arabic | (any) |
| Omar | Quran Studies | (any) |
| Noor | English | (any) |
| Noor | Computer Science | Grade 11 |

---

## 4. Modified Entities

### 4.1 ClassSection → **Group** (Renamed)

Entity renamed from `ClassSection` to `Group`. Fields unchanged.

| Field | Type | Notes |
|-------|------|-------|
| Name | string | "9-A", "10-B" |
| GradeId | Guid | FK → Grade |
| Capacity | int | Max students |
| IsActive | bool | |

**Impact:** All references to `ClassSectionId` across the codebase become `GroupId`. DTOs rename accordingly (`ClassSectionDto` → `GroupDto`, `classSectionName` → `groupName`, etc.).

**Nav Properties:** StudentAssignments, TimetableVersions (NEW), TimetableEntries (removed — entries go through versions)

---

### 4.2 Subject (Modified)

| Field | Change | Notes |
|-------|--------|-------|
| RequiredRoomType | **ADDED** — RoomType? (nullable) | null = any room type acceptable. If set, timetable entries must use a room of this type. |

**Example:**
- Mathematics → null (any classroom)
- Physics → ScienceLab
- Computer Science → ComputerLab
- Arabic → null

---

### 4.3 TeacherProfile (Modified)

| Field | Change | Notes |
|-------|--------|-------|
| MaxPeriodsPerDay | **ADDED** — int, default 6 | Hard cap on scheduled periods in any single day |
| MaxPeriodsPerWeek | **ADDED** — int, default 25 | Hard cap on total scheduled periods across the week |

**Impact:** These limits are enforced during timetable publication validation. They count entries across ALL published timetable versions in the semester (not just one group).

**New Nav Property:** TeacherSubjectLinks (collection)

---

### 4.4 SchoolTenant (Modified)

| Field | Change | Notes |
|-------|--------|-------|
| WorkingDays | **ADDED** — DayOfWeekFlag (bitwise), default 31 | Sun(1)+Mon(2)+Tue(4)+Wed(8)+Thu(16) = 31 for Saudi schools |

**Business Rules:**
- Timetable entries can only be created for days included in WorkingDays
- The existing `DayOfWeekFlag` enum (previously unused) is now repurposed for this

---

### 4.5 TimetableVersion (Modified)

| Field | Change | Notes |
|-------|--------|-------|
| GroupId | **ADDED** — Guid FK → Group, required | Each version is scoped to one group |
| ClassSectionId | n/a | (was never on this entity) |

**Unchanged Fields:** Name, SemesterId, VersionNumber, Status, PublishedAt, PublishedBy

**Key Semantic Change:** A timetable version is now a commitment for **one Group in one Semester**. VersionNumber auto-increments within (Group + Semester), not just Semester.

**Unique Constraint:** (SchoolTenantId, GroupId, SemesterId, VersionNumber)

**Nav Properties:** Group, Semester, Entries

**Status Lifecycle:**
```
Draft ──→ Published ──→ Archived
  ↑                        │
  └────────────────────────┘  (create new version)
```

---

### 4.6 TimetableEntry (Modified — Major)

| Field | Status | Notes |
|-------|--------|-------|
| TimetableVersionId | KEPT | FK → TimetableVersion |
| SubjectId | KEPT | FK → Subject |
| TeacherProfileId | KEPT | FK → TeacherProfile |
| RoomId | **REPLACES `Room`** | FK → Room entity (was string) |
| DayOfWeek | KEPT | System.DayOfWeek |
| PeriodDefinitionId | **REPLACES `StartTime`/`EndTime`** | FK → PeriodDefinition |
| ~~ClassSectionId~~ | **REMOVED** | Derived from Version → Group |
| ~~GradeId~~ | **REMOVED** | Derived from Version → Group → Grade |
| ~~StartTime~~ | **REMOVED** | Derived from PeriodDefinition.StartTime |
| ~~EndTime~~ | **REMOVED** | Derived from PeriodDefinition.EndTime |
| ~~Room~~ (string) | **REMOVED** | Replaced by RoomId FK |

**Unique Constraint:** (TimetableVersionId, DayOfWeek, PeriodDefinitionId) — one entry per slot per version

**All four bindings are required (non-nullable):** SubjectId, TeacherProfileId, RoomId, PeriodDefinitionId

**Nav Properties:** TimetableVersion, Subject, TeacherProfile, Room, PeriodDefinition

---

### 4.7 StudentAssignment (Modified)

| Field | Change |
|-------|--------|
| ~~ClassSectionId~~ | Renamed to **GroupId** |
| ~~ClassSection~~ (nav) | Renamed to **Group** |

All other fields unchanged: StudentProfileId, GradeId, GroupId, SemesterId, IsActive

---

### 4.8 SupervisorScope (Modified)

| Field | Change |
|-------|--------|
| ~~ClassSectionId~~ | Renamed to **GroupId** |

All other fields unchanged.

---

### 4.9 AttendanceRecord (Modified)

| Field | Change |
|-------|--------|
| ~~ClassSectionId~~ | Renamed to **GroupId** |

All other fields unchanged. The teacher-subject-group context for attendance submission is derived from the published timetable.

---

## 5. Removed Entities

### 5.1 TeacherAssignment → **REMOVED**

**Reason:** In the new design, a teacher's schedule IS defined by TimetableEntry records in published versions. There is no need for a separate assignment table.

**Replaced By:**
- **TeacherSubjectLink** — declares what a teacher CAN teach (qualification)
- **TimetableEntry** — declares what a teacher DOES teach (schedule)

**Migration Impact:**
- Services that queried TeacherAssignment (Dashboard, Attendance, WeeklyReport) must now query published TimetableEntry records instead
- "How many students does this teacher have?" → query published entries → get groups → count student assignments
- "What does this teacher teach today?" → query published entries for teacher + today's DayOfWeek

---

## 6. New Enum

### RoomType

```csharp
public enum RoomType
{
    Classroom = 0,
    ScienceLab = 1,
    ComputerLab = 2,
    ArtRoom = 3,
    MusicRoom = 4,
    Gymnasium = 5,
    Library = 6,
    Workshop = 7
}
```

---

## 7. Complete Entity Diagram

```
SchoolTenant
 ├── PeriodDefinition[]        ← NEW
 ├── Room[]                    ← NEW
 ├── Grade[]
 │    ├── Group[] (was ClassSection)
 │    │    ├── StudentAssignment[] (student → group per semester)
 │    │    └── TimetableVersion[] (one chain per group+semester) ← MODIFIED
 │    │         └── TimetableEntry[] ← MODIFIED (subject+teacher+room+period)
 │    └── CurriculumContract[] ← NEW (grade+semester → subject requirements)
 ├── Subject[]
 │    └── RequiredRoomType?    ← NEW field
 ├── Department[]
 ├── Semester[]
 ├── TeacherProfile[]
 │    ├── MaxPeriodsPerDay     ← NEW field
 │    ├── MaxPeriodsPerWeek    ← NEW field
 │    └── TeacherSubjectLink[] ← NEW (qualification)
 ├── StudentProfile[]
 ├── ParentProfile[] → ParentLink[] → StudentProfile[]
 ├── AttendanceRecord[]        (GroupId replaces ClassSectionId)
 ├── GradeRecord[]
 ├── BehaviorFeedback[]
 ├── WeeklyReport[] → WeeklyReportItem[]
 ├── InternalReport[] → InternalReportComment[]
 ├── SupervisorScope[]         (GroupId replaces ClassSectionId)
 ├── PerformanceAttributeDefinition[]
 ├── NotificationEvent[]
 ├── AuditLog[]
 └── FeatureFlag[]
```

---

## 8. Publication Validation Rules

When `Publish(versionId)` is called, **ALL** of the following must pass. If any fail, publication is blocked and all violations are returned.

### Rule 1: Curriculum Fulfillment

```
FOR EACH contract IN CurriculumContract WHERE GradeId = version.Group.GradeId AND SemesterId = version.SemesterId:
    actual = COUNT entries in version WHERE SubjectId = contract.SubjectId
    IF actual ≠ contract.PeriodsPerWeek → FAIL
        "Subject '{subject.Name}' requires {contract.PeriodsPerWeek} periods/week, but {actual} are scheduled."

FOR EACH entry.SubjectId NOT IN any CurriculumContract for this grade+semester:
    → WARN "Subject '{subject.Name}' is scheduled but has no curriculum contract."
```

### Rule 2: Teacher Time Conflict (Cross-Group)

```
FOR EACH entry IN version:
    conflicting = ANY TimetableEntry in OTHER Published versions
        WHERE SemesterId = version.SemesterId
        AND TeacherProfileId = entry.TeacherProfileId
        AND DayOfWeek = entry.DayOfWeek
        AND PeriodDefinitionId = entry.PeriodDefinitionId
    IF conflicting → FAIL
        "Teacher '{name}' is already scheduled at {day} {period} for Group '{other.Group.Name}'."
```

### Rule 3: Room Time Conflict (Cross-Group)

```
FOR EACH entry IN version:
    conflicting = ANY TimetableEntry in OTHER Published versions
        WHERE SemesterId = version.SemesterId
        AND RoomId = entry.RoomId
        AND DayOfWeek = entry.DayOfWeek
        AND PeriodDefinitionId = entry.PeriodDefinitionId
    IF conflicting → FAIL
        "Room '{room.Name}' is already booked at {day} {period} by Group '{other.Group.Name}'."
```

### Rule 4: Teacher Daily Limit

```
FOR EACH teacher referenced in version entries:
    FOR EACH day with entries for this teacher (in THIS version + all OTHER Published versions for same semester):
        totalInDay = COUNT entries for teacher on that day
        IF totalInDay > teacher.MaxPeriodsPerDay → FAIL
            "Teacher '{name}' has {totalInDay} periods on {day}, exceeding limit of {teacher.MaxPeriodsPerDay}."
```

### Rule 5: Teacher Weekly Limit

```
FOR EACH teacher referenced in version entries:
    totalInWeek = COUNT entries for teacher across THIS version + all OTHER Published versions for same semester
    IF totalInWeek > teacher.MaxPeriodsPerWeek → FAIL
        "Teacher '{name}' has {totalInWeek} periods/week, exceeding limit of {teacher.MaxPeriodsPerWeek}."
```

### Rule 6: Room Type Match

```
FOR EACH entry IN version:
    IF entry.Subject.RequiredRoomType IS NOT NULL
        AND entry.Room.RoomType ≠ entry.Subject.RequiredRoomType → FAIL
            "Subject '{subject.Name}' requires a {required} but is assigned to '{room.Name}' ({room.RoomType})."
```

### Rule 7: Room Capacity

```
FOR EACH entry IN version:
    groupStudentCount = COUNT active StudentAssignments for version.GroupId in version.SemesterId
    IF groupStudentCount > entry.Room.Capacity → FAIL
        "Room '{room.Name}' (capacity {room.Capacity}) cannot fit Group '{group.Name}' ({groupStudentCount} students)."
```

### Rule 8: Teacher Qualification

```
FOR EACH entry IN version:
    qualified = ANY TeacherSubjectLink WHERE
        TeacherProfileId = entry.TeacherProfileId
        AND SubjectId = entry.SubjectId
        AND (GradeId IS NULL OR GradeId = version.Group.GradeId)
        AND IsActive = true
    IF NOT qualified → FAIL
        "Teacher '{name}' is not qualified to teach '{subject.Name}' for {grade.Name}."
```

### Intra-Version Integrity (always enforced, even on draft saves)

```
    No duplicate slot: (DayOfWeek, PeriodDefinitionId) must be unique within a version
    No break periods: PeriodDefinition.IsBreak must be false
    Valid working day: DayOfWeek must be in SchoolTenant.WorkingDays
```

---

## 9. Service Interfaces

### 9.1 NEW: IPeriodDefinitionService

```csharp
Task<Result<List<PeriodDefinitionDto>>> GetPeriodsAsync(Guid tenantId, CancellationToken ct);
Task<Result<PeriodDefinitionDto>> CreateAsync(Guid tenantId, CreatePeriodDefinitionRequest req, CancellationToken ct);
Task<Result<PeriodDefinitionDto>> UpdateAsync(Guid id, CreatePeriodDefinitionRequest req, CancellationToken ct);
Task<Result> DeleteAsync(Guid id, CancellationToken ct);
```

### 9.2 NEW: IRoomService

```csharp
Task<Result<List<RoomDto>>> GetRoomsAsync(Guid tenantId, RoomType? type, CancellationToken ct);
Task<Result<RoomDto>> CreateAsync(Guid tenantId, CreateRoomRequest req, CancellationToken ct);
Task<Result<RoomDto>> UpdateAsync(Guid id, UpdateRoomRequest req, CancellationToken ct);
Task<Result> DeleteAsync(Guid id, CancellationToken ct);
```

### 9.3 NEW: ICurriculumService

```csharp
Task<Result<List<CurriculumContractDto>>> GetContractsAsync(Guid tenantId, Guid gradeId, Guid semesterId, CancellationToken ct);
Task<Result<CurriculumContractDto>> SetContractAsync(Guid tenantId, SetCurriculumContractRequest req, CancellationToken ct);  // upsert
Task<Result> RemoveContractAsync(Guid id, CancellationToken ct);
```

### 9.4 NEW: ITeacherSubjectLinkService

```csharp
Task<Result<List<TeacherSubjectLinkDto>>> GetLinksAsync(Guid tenantId, Guid? teacherProfileId, CancellationToken ct);
Task<Result<TeacherSubjectLinkDto>> CreateAsync(Guid tenantId, CreateTeacherSubjectLinkRequest req, CancellationToken ct);
Task<Result> RemoveAsync(Guid id, CancellationToken ct);
```

### 9.5 REDESIGNED: ITimetableService

```csharp
// --- Versions ---
Task<Result<List<TimetableVersionDto>>> GetVersionsAsync(Guid tenantId, Guid? groupId, Guid? semesterId, CancellationToken ct);
Task<Result<TimetableVersionDto>> CreateVersionAsync(Guid tenantId, CreateTimetableVersionRequest req, CancellationToken ct);
    // req: { GroupId, SemesterId, Name }
    // auto-increments VersionNumber within (Group + Semester)

// --- Entries ---
Task<Result<List<TimetableEntryDto>>> GetEntriesAsync(Guid versionId, CancellationToken ct);
Task<Result<TimetableEntryDto>> AddEntryAsync(Guid tenantId, AddTimetableEntryRequest req, CancellationToken ct);
    // req: { TimetableVersionId, SubjectId, TeacherProfileId, RoomId, DayOfWeek, PeriodDefinitionId }
    // validates: slot uniqueness, not a break period, valid working day, teacher qualification, room type
Task<Result> RemoveEntryAsync(Guid entryId, CancellationToken ct);

// --- Validation & Publication ---
Task<Result<List<TimetableValidationError>>> ValidateForPublicationAsync(Guid versionId, CancellationToken ct);
    // Runs ALL 8 rules, returns full list of violations
Task<Result> PublishAsync(Guid versionId, string publishedBy, CancellationToken ct);
    // Calls ValidateForPublication first; blocks if any errors
    // Archives previous published version for same group+semester
Task<Result> ArchiveAsync(Guid versionId, CancellationToken ct);

// --- Query (for other services) ---
Task<Result<List<TimetableEntryDto>>> GetTeacherScheduleAsync(Guid teacherProfileId, Guid semesterId, CancellationToken ct);
    // Returns entries from all Published versions for this teacher in the semester
Task<Result<List<TimetableEntryDto>>> GetGroupScheduleAsync(Guid groupId, Guid semesterId, CancellationToken ct);
    // Returns entries from the Published version for this group+semester
```

### 9.6 MODIFIED: IAssignmentService

```csharp
// Student assignments remain (students assigned to groups)
Task<Result<List<StudentAssignmentDto>>> GetStudentAssignmentsAsync(Guid tenantId, Guid? semesterId, Guid? gradeId, Guid? groupId, CancellationToken ct);
Task<Result<StudentAssignmentDto>> CreateStudentAssignmentAsync(Guid tenantId, CreateStudentAssignmentRequest req, CancellationToken ct);
Task<Result> RemoveStudentAssignmentAsync(Guid id, CancellationToken ct);

// Teacher assignments REMOVED — use TeacherSubjectLink + Timetable instead
```

### 9.7 MODIFIED: IDashboardService

All dashboard methods that previously queried `TeacherAssignment` now query published `TimetableEntry` records:

- **TeacherDashboard.TodaySessions** → query published entries WHERE TeacherProfileId + DayOfWeek = today
- **TeacherDashboard.TotalAssignedStudents** → from published entries → get groups → count student assignments
- **ManagerDashboard.MissingAttendance** → from published entries for today → check which sessions lack attendance records
- **Compliance calculations** → based on published timetable entries, not TeacherAssignment

### 9.8 MODIFIED: IAttendanceService

`SubmitAttendanceAsync` now validates that the teacher actually has a published timetable entry for the given subject + group on the given date's DayOfWeek.

### 9.9 UNCHANGED Services

IAcademicService, IAuthService, IAuditService, IFeatureFlagService, IGradeRecordService, IInternalReportService, IJwtService, ITenantService, IUserService, IWeeklyReportService — interfaces unchanged (internal queries may adapt to renamed fields).

---

## 10. DTOs

### New DTOs

```csharp
// PeriodDefinition
record PeriodDefinitionDto(Guid Id, int PeriodNumber, string Label, TimeSpan StartTime, TimeSpan EndTime, bool IsBreak, bool IsActive);
record CreatePeriodDefinitionRequest(int PeriodNumber, string Label, TimeSpan StartTime, TimeSpan EndTime, bool IsBreak);

// Room
record RoomDto(Guid Id, string Name, string Code, RoomType RoomType, int Capacity, string? Building, int? Floor, bool IsActive);
record CreateRoomRequest(string Name, string Code, RoomType RoomType, int Capacity, string? Building, int? Floor);
record UpdateRoomRequest(string Name, string Code, RoomType RoomType, int Capacity, string? Building, int? Floor);

// CurriculumContract
record CurriculumContractDto(Guid Id, Guid GradeId, string GradeName, Guid SemesterId, string SemesterName, Guid SubjectId, string SubjectName, int PeriodsPerWeek);
record SetCurriculumContractRequest(Guid GradeId, Guid SemesterId, Guid SubjectId, int PeriodsPerWeek);

// TeacherSubjectLink
record TeacherSubjectLinkDto(Guid Id, Guid TeacherProfileId, string TeacherName, Guid SubjectId, string SubjectName, Guid? GradeId, string? GradeName, bool IsActive);
record CreateTeacherSubjectLinkRequest(Guid TeacherProfileId, Guid SubjectId, Guid? GradeId);

// TimetableEntry (redesigned)
record TimetableEntryDto(
    Guid Id, Guid TimetableVersionId,
    Guid SubjectId, string SubjectName,
    Guid TeacherProfileId, string TeacherName,
    Guid RoomId, string RoomName, RoomType RoomType,
    DayOfWeek DayOfWeek,
    Guid PeriodDefinitionId, int PeriodNumber, string PeriodLabel, TimeSpan StartTime, TimeSpan EndTime
);

record AddTimetableEntryRequest(Guid TimetableVersionId, Guid SubjectId, Guid TeacherProfileId, Guid RoomId, DayOfWeek DayOfWeek, Guid PeriodDefinitionId);

// TimetableVersion (modified)
record TimetableVersionDto(
    Guid Id, string Name,
    Guid GroupId, string GroupName,
    Guid SemesterId, string SemesterName,
    int VersionNumber, TimetableStatus Status,
    DateTime? PublishedAt, int EntryCount
);

record CreateTimetableVersionRequest(Guid GroupId, Guid SemesterId, string Name);

// Validation
record TimetableValidationError(string Rule, string Severity, string Message);
    // Rule: "CurriculumFulfillment", "TeacherConflict", "RoomConflict", "TeacherDailyLimit", "TeacherWeeklyLimit", "RoomTypeMatch", "RoomCapacity", "TeacherQualification"
    // Severity: "Error" (blocks publish), "Warning" (informational)

// Group (renamed from ClassSection)
record GroupDto(Guid Id, string Name, Guid GradeId, string GradeName, int Capacity, bool IsActive, int StudentCount);
```

### Modified DTOs

```csharp
// Subject — add RequiredRoomType
record SubjectDto(Guid Id, string Name, string? Code, Guid? DepartmentId, string? DepartmentName, RoomType? RequiredRoomType, bool IsActive);

// StudentAssignment — ClassSectionId/Name → GroupId/Name
record StudentAssignmentDto(Guid Id, Guid StudentProfileId, string StudentName, Guid GradeId, string GradeName, Guid GroupId, string GroupName, Guid SemesterId, string SemesterName, bool IsActive);

// Attendance — ClassSectionId/Name → GroupId/Name
record AttendanceRecordDto(Guid Id, Guid StudentProfileId, string StudentName, Guid SubjectId, string SubjectName, Guid GroupId, string GroupName, DateTime Date, TimeSpan? SessionTime, AttendanceStatus Status, string? Notes);
```

---

## 11. API Endpoints

### New Controllers

#### PeriodDefinitionsController — `/api/period-definitions`

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/period-definitions` | List all periods for tenant |
| POST | `/api/period-definitions` | Create period definition |
| PUT | `/api/period-definitions/{id}` | Update period definition |
| DELETE | `/api/period-definitions/{id}` | Soft delete |

#### RoomsController — `/api/rooms`

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/rooms?type={RoomType}` | List rooms, optional type filter |
| POST | `/api/rooms` | Create room |
| PUT | `/api/rooms/{id}` | Update room |
| DELETE | `/api/rooms/{id}` | Soft delete |

#### CurriculumController — `/api/curriculum`

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/curriculum?gradeId={}&semesterId={}` | List contracts for grade+semester |
| POST | `/api/curriculum` | Create or update (upsert) contract |
| DELETE | `/api/curriculum/{id}` | Remove contract |

#### TeacherSubjectLinksController — `/api/teacher-subject-links`

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/teacher-subject-links?teacherProfileId={}` | List links, optional teacher filter |
| POST | `/api/teacher-subject-links` | Create link |
| DELETE | `/api/teacher-subject-links/{id}` | Remove link |

### Modified: TimetableController — `/api/timetable`

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/timetable/versions?groupId={}&semesterId={}` | List versions, filter by group/semester |
| POST | `/api/timetable/versions` | Create draft version for group+semester |
| GET | `/api/timetable/versions/{id}/entries` | Get all entries in a version |
| POST | `/api/timetable/entries` | Add entry to draft version |
| DELETE | `/api/timetable/entries/{id}` | Remove entry from draft |
| POST | `/api/timetable/versions/{id}/validate` | Run all 8 validation rules, return errors |
| POST | `/api/timetable/versions/{id}/publish` | Validate + publish (or fail with errors) |
| POST | `/api/timetable/versions/{id}/archive` | Archive a published version |
| GET | `/api/timetable/teacher/{teacherProfileId}?semesterId={}` | Teacher's full schedule from published versions |
| GET | `/api/timetable/group/{groupId}?semesterId={}` | Group's schedule from published version |

### Modified: AcademicController

- `/api/academic/classes` → `/api/academic/groups` (route rename)
- Request/response DTOs use `GroupDto` instead of `ClassSectionDto`

### Modified: AssignmentsController

- Teacher assignment endpoints **removed**
- Student assignment endpoints remain, using `GroupId`

### Unchanged Controllers

AuthController, TenantsController, UsersController (departments/grades/semesters), AttendanceController, GradesController, WeeklyReportsController, InternalReportsController, DashboardController, NotificationsController (placeholder)

---

## 12. Frontend Changes

### New Pages

| Component | Route | Purpose |
|-----------|-------|---------|
| PeriodDefinitionsComponent | `/academic/periods` | Manage school period structure |
| RoomsComponent | `/rooms` | Manage rooms with types and capacity |
| CurriculumComponent | `/curriculum` | Define subject requirements per grade+semester |
| TeacherSubjectLinksComponent | `/teacher-subjects` | Manage teacher qualifications |

### Modified Pages

| Component | Changes |
|-----------|---------|
| TimetableComponent | Complete redesign: group selector → grid (days × periods) → add entries (subject+teacher+room picker) → validate button → publish button with error display |
| AssignmentsComponent | Remove teacher assignment tab; keep student assignment tab; rename class → group |
| ClassesComponent → GroupsComponent | Rename route to `/academic/groups` |
| DashboardComponent | No visual changes; data sources change internally |
| AttendanceComponent | Rename class references to group |

### New Frontend Models

```typescript
// period-definition.model.ts
export interface PeriodDefinitionDto { id: string; periodNumber: number; label: string; startTime: string; endTime: string; isBreak: boolean; isActive: boolean; }

// room.model.ts
export interface RoomDto { id: string; name: string; code: string; roomType: RoomType; capacity: number; building?: string; floor?: number; isActive: boolean; }
export enum RoomType { Classroom = 'Classroom', ScienceLab = 'ScienceLab', ComputerLab = 'ComputerLab', ArtRoom = 'ArtRoom', MusicRoom = 'MusicRoom', Gymnasium = 'Gymnasium', Library = 'Library', Workshop = 'Workshop' }

// curriculum.model.ts
export interface CurriculumContractDto { id: string; gradeId: string; gradeName: string; semesterId: string; semesterName: string; subjectId: string; subjectName: string; periodsPerWeek: number; }

// teacher-subject-link.model.ts
export interface TeacherSubjectLinkDto { id: string; teacherProfileId: string; teacherName: string; subjectId: string; subjectName: string; gradeId?: string; gradeName?: string; isActive: boolean; }

// timetable.model.ts (modified)
export interface TimetableValidationError { rule: string; severity: string; message: string; }
```

### New Frontend Services (in data.service.ts)

```typescript
PeriodDefinitionService   → getAll, create, update, delete
RoomService               → getAll, create, update, delete
CurriculumService         → getContracts, setContract, removeContract
TeacherSubjectLinkService → getLinks, create, remove
```

### Sidebar Navigation Update

```
Dashboard
─── Academic
    ├── Grades
    ├── Groups           ← renamed from "Classes"
    ├── Subjects
    ├── Departments
    ├── Semesters
    ├── Periods          ← NEW
    └── Curriculum       ← NEW
─── Rooms                ← NEW
─── Teacher Subjects     ← NEW
─── Student Assignments  ← simplified (students only)
─── Timetable           ← redesigned
─── Attendance
─── Grade Records
─── Weekly Reports
─── Internal Reports
─── Schools              (SuperAdmin)
─── Users
```

---

## 13. Seed Data Changes

### New Seed Data

- **9 PeriodDefinitions:** 7 teaching periods + 2 breaks (as shown in §3.1 example)
- **10 Rooms:** 5 classrooms + 2 science labs + 1 computer lab + 1 art room + 1 gymnasium
- **~18 CurriculumContracts:** Requirements for Grade 9, 10, 11 × subjects per semester
- **~10 TeacherSubjectLinks:** Teacher qualifications matching current specializations

### Modified Seed Data

- ClassSection references → Group references (same data, renamed)
- TimetableVersion: add GroupId (create one version per group, each with their entries)
- TimetableEntry: replace Room string with RoomId FK, replace StartTime/EndTime with PeriodDefinitionId
- StudentAssignment: ClassSectionId → GroupId
- Remove all TeacherAssignment seed data (no longer exists)

---

## 15. Attendance Module — Full Specification

> **Added: March 5, 2026**
> Comprehensive attendance module with submission lifecycle, role-based access, edit permissions, and audit trail.

### 15.1 Overview

The Attendance Module records, monitors, and reports student attendance for all scheduled academic sessions. Data integrity is enforced by linking attendance strictly to the official published timetable and enforcing role-based access controls.

### 15.2 Roles and Permissions

#### Teacher
- **Primary data owner** for classroom attendance
- View their assigned timetable sessions only
- Record and submit attendance for assigned sessions only
- Save attendance as **Draft** before final submission
- Edit submitted records **only** within the grace period OR if Admin has granted an explicit edit permission
- **Blocked from**: creating/modifying timetable entries, accessing unassigned sessions, editing after lock without permission

#### Teacher Supervisor
- **Compliance monitor** for supervised teachers
- View real-time attendance records for all supervised teachers
- Monitor submission status of all scheduled sessions (Submitted / Submitted Late / Missing)
- Issue system-level reminders to teachers with Missing submissions
- **Blocked from**: creating, submitting, or modifying any attendance records

#### School Manager
- Full **read-only** access to all attendance records and weekly summaries
- Access analytical reports on submission trends and attendance percentages
- **Blocked from**: creating, submitting, or editing any records

#### School Admin
- **Universal visibility** of all attendance data
- Edit or correct any attendance record at any time (requires "Reason for Change" for audit log)
- Unlock sessions for teachers (grant temporary edit permissions — time-windowed or session-specific)
- Full access to audit and traceability logs
- **Blocked from**: modifying timetable structure via the Attendance Module

### 15.3 Submission Lifecycle & Status Definitions

Every attendance submission transitions through these states:

| Status | Stored? | Description |
|--------|---------|-------------|
| **Draft** | Yes | Entry started but not finalized. Teacher can modify freely. |
| **Submitted** | Yes | Finalized before session end time. Locked after grace period. |
| **Submitted Late** | Yes | Finalized after the session end time. |
| **Missing** | No (computed) | No submission exists after the session end time. Computed on-the-fly by comparing timetable schedule vs existing records. |
| **Updated** | Yes | A previously submitted record modified by an authorized user. |

**Grace Period**: Configurable per school (default: 15 minutes). After submission, a teacher can still edit within this window without needing admin unlock. Stored as `SchoolTenant.GracePeriodMinutes`.

### 15.4 New Enum: SubmissionStatus

```csharp
public enum SubmissionStatus
{
    Draft = 0,
    Submitted = 1,
    SubmittedLate = 2,
    Updated = 3
}
```

Note: `Missing` is never stored — it is computed at query time.

### 15.5 New Entity: AttendanceEditPermission (TenantEntity)

Allows an Admin to grant a teacher temporary edit access to locked attendance records.

| Field | Type | Notes |
|-------|------|-------|
| Id | Guid | PK (from BaseEntity) |
| SchoolTenantId | Guid | FK → SchoolTenant (from TenantEntity) |
| TeacherProfileId | Guid | FK → TeacherProfile — who gets the permission |
| TimetableEntryId | Guid? | FK → TimetableEntry — null = all sessions in the time window |
| ValidFrom | DateTime | Start of the permission window |
| ValidUntil | DateTime | End of the permission window |
| GrantedByUserId | Guid | The admin user who granted this |
| GrantedByName | string | Display name of the admin |
| Reason | string | Why the unlock was granted |
| IsRevoked | bool | Default false; set true to cancel early |
| RevokedAt | DateTime? | When it was revoked |

**Unique constraint**: `(SchoolTenantId, TeacherProfileId, TimetableEntryId, ValidFrom)`

### 15.6 Modified Entity: AttendanceRecord

New/changed fields on the existing `AttendanceRecord` entity:

| Field | Type | Notes |
|-------|------|-------|
| SubmissionStatus | SubmissionStatus | Default: Draft. Tracks the submission lifecycle. |
| TimetableEntryId | Guid? | FK → TimetableEntry. Links record to the exact scheduled session. |
| SubmittedAt | DateTime? | Timestamp when status transitions from Draft → Submitted/SubmittedLate. |
| LastEditedAt | DateTime? | Timestamp of the last edit after initial submission. |
| LastEditedBy | string? | User ID of the last editor. |
| EditReason | string? | Required when Admin edits or teacher edits with unlock permission. |

### 15.7 Modified Entity: SchoolTenant

| Field | Type | Notes |
|-------|------|-------|
| GracePeriodMinutes | int | Default: 15. How long after submission a teacher can still edit without admin unlock. |

### 15.8 New AuditAction Values

```csharp
AttendanceSubmit = 14,   // Teacher finalizes Draft → Submitted/SubmittedLate
AttendanceEdit = 15,     // Any authorized edit of a submitted record
AttendanceUnlock = 16    // Admin grants edit permission
```

### 15.9 DTOs

#### Updated: AttendanceRecordDto
Add fields: `submissionStatus`, `timetableEntryId`, `submittedAt`, `periodLabel`, `startTime`, `endTime`

#### Updated: SubmitAttendanceRequest
Add field: `timetableEntryId` (required — links to exact session)

#### New: UpdateAttendanceEntryRequest
```
{ attendanceRecordId: Guid, status: AttendanceStatus, notes: string?, editReason: string }
```

#### New: GrantEditPermissionRequest
```
{ teacherProfileId: Guid, timetableEntryId: Guid?, validFrom: DateTime, validUntil: DateTime, reason: string }
```

#### New: AttendanceEditPermissionDto
Mirrors the entity for API responses.

#### New: SessionComplianceDto
```
{ timetableEntryId, dayOfWeek, periodLabel, subjectName, groupName, teacherName, submissionStatus (Submitted|SubmittedLate|Missing), submittedAt? }
```

#### Updated: AttendanceComplianceDto
Populate `lateDays` (count of SubmittedLate), add `missingSessions` count.

### 15.10 Service Interface Changes

New methods on `IAttendanceService`:

```csharp
Task<Result> UpdateAttendanceAsync(Guid tenantId, Guid callerUserId, string callerRole, UpdateAttendanceEntryRequest request, CancellationToken ct);
Task<Result<List<SessionComplianceDto>>> GetSessionComplianceAsync(Guid tenantId, Guid semesterId, DateTime? date, Guid? teacherProfileId, CancellationToken ct);
Task<Result<AttendanceEditPermissionDto>> GrantEditPermissionAsync(Guid tenantId, Guid adminUserId, GrantEditPermissionRequest request, CancellationToken ct);
Task<Result> RevokeEditPermissionAsync(Guid permissionId, Guid adminUserId, CancellationToken ct);
Task<Result<List<AttendanceEditPermissionDto>>> GetEditPermissionsAsync(Guid tenantId, Guid? teacherProfileId, CancellationToken ct);
```

Modified existing method — `SubmitAttendanceAsync`:
- Resolve `TeacherProfileId` from authenticated user claims (not query string)
- Validate `timetableEntryId` exists, is published, belongs to this teacher and group
- Server-side duplicate prevention: reject if Submitted/SubmittedLate records already exist for same StudentProfileId + TimetableEntryId + Date
- Allow re-submit of Draft records (update instead of duplicate)
- Auto-assign `Submitted` vs `SubmittedLate` by comparing `DateTime.UtcNow` against `PeriodDefinition.EndTime`
- Write `AuditAction.AttendanceSubmit` audit log entry

### 15.11 Controller Endpoints

| Method | Route | Auth Roles | Description |
|--------|-------|------------|-------------|
| POST | `api/attendance/submit` | Teacher | Submit attendance (teacherProfileId resolved server-side) |
| PUT | `api/attendance/{id}` | Teacher, SchoolAdmin | Edit a record (checks grace period / edit permission / admin role) |
| GET | `api/attendance` | Teacher, Supervisor, Manager, Admin | Get records by date + optional filters |
| GET | `api/attendance/student/{id}` | Supervisor, Manager, Admin, Parent (own children), Student (self only) | Get student's attendance |
| GET | `api/attendance/compliance` | Supervisor, Manager, Admin | Aggregate compliance stats |
| GET | `api/attendance/session-compliance` | Supervisor, Manager, Admin | Per-session submission status grid |
| POST | `api/attendance/edit-permissions` | SchoolAdmin | Grant edit unlock |
| DELETE | `api/attendance/edit-permissions/{id}` | SchoolAdmin | Revoke edit unlock |
| GET | `api/attendance/edit-permissions` | SchoolAdmin | List active permissions |

**Security fix**: Remove `teacherProfileId` from submit endpoint query string. Resolve from JWT claims.

### 15.12 Edit Protocol

When `UpdateAttendanceAsync` is called:
1. Load the existing `AttendanceRecord`
2. Authorization check (in order):
   a. **SchoolAdmin** → always allowed; `editReason` required
   b. **Teacher** (original submitter only):
      - Within grace period (`SubmittedAt + GracePeriodMinutes > now`) → allowed
      - Else check `AttendanceEditPermission` for active, non-revoked permission covering this session/time → allowed if found
      - Otherwise → reject "Edit permission required"
   c. All other roles → reject
3. Update fields, set `SubmissionStatus = Updated`, `LastEditedAt`, `LastEditedBy`, `EditReason`
4. Write `AuditAction.AttendanceEdit` audit log with old value, new value, reason, authorization type

### 15.13 Missing Status Computation

"Missing" is **never stored** — it is computed on-the-fly:
1. Query published `TimetableEntry` records for the given semester/date
2. Left-join with `AttendanceRecord` to find which sessions have submissions
3. For sessions with no records where the session end time has passed → status = "Missing"
4. Return in `SessionComplianceDto` alongside Submitted/SubmittedLate sessions

### 15.14 Frontend Views (by Role)

#### Teacher View
- Session picker from published timetable (only assigned sessions)
- Student roster auto-loaded for selected session
- Mark each student: Present / Absent / Late / Excused
- "Save as Draft" button + "Submit" button
- After submission: grace period countdown visible; Edit button enabled during grace period or when admin has granted permission
- "All Present" / "All Absent" bulk actions

#### Supervisor View
- Date picker + compliance grid for all supervised teachers
- Color-coded: ✅ Submitted (green), ⚠️ Submitted Late (yellow), ❌ Missing (red)
- "Send Reminder" button for Missing sessions

#### Admin View
- Full read access to all records
- Click any record to edit with "Reason for Change" dialog
- "Unlock Session" button → opens grant-permission form
- Audit log viewer for attendance changes

#### Manager View
- Read-only aggregate dashboard (same as Supervisor minus reminder action)

#### Parent View
- Per-child attendance summary by subject: total sessions, present count, absent count, percentage

### 15.15 Business Rules Summary

| Rule | Implementation |
|------|---------------|
| One record per student per session | Unique constraint: `(StudentProfileId, TimetableEntryId, Date)` |
| Teacher can only submit for assigned sessions | Validate `TimetableEntry.TeacherProfileId == callerTeacherProfileId` |
| Block URL-tampering | Server-side tenant + teacher verification on all mutations |
| Audit every edit | `AuditLog` entry with old value, new value, reason, authorization type |
| Edit requires authorization | Grace period OR admin unlock OR admin role |
| Weekly report refresh on Update | Any `SubmissionStatus = Updated` triggers report recalculation |

### 15.16 Attendance Migration Checklist

28. ☐ Add `SubmissionStatus` enum to Enums.cs
29. ☐ Extend `AttendanceRecord` entity with new fields
30. ☐ Create `AttendanceEditPermission` entity + DbSet + configuration
31. ☐ Add `GracePeriodMinutes` to `SchoolTenant`
32. ☐ Add `AttendanceSubmit`, `AttendanceEdit`, `AttendanceUnlock` to `AuditAction` enum
33. ☐ Update attendance DTOs (add new fields, new request/response types)
34. ☐ Extend `IAttendanceService` with new methods
35. ☐ Rewrite `SubmitAttendanceAsync` (server-side teacher verification, duplicate prevention, timetable validation, status assignment, audit)
36. ☐ Implement `UpdateAttendanceAsync` (edit protocol with grace period + permission check)
37. ☐ Implement `GetSessionComplianceAsync` (on-the-fly Missing computation)
38. ☐ Implement edit permission CRUD methods
39. ☐ Harden `AttendanceController` (remove teacherProfileId from query, add new endpoints)
40. ☐ Frontend: add `SubmissionStatus` enum, update models
41. ☐ Frontend: update `AttendanceService` in data.service.ts
42. ☐ Frontend: overhaul attendance component with role-specific views
43. ☐ Frontend: add Parent attendance visibility to sidebar + routes
44. ☐ Generate EF Core migration for schema changes
45. ☐ Update seeder with sample attendance data using new statuses
46. ☐ Build verification: 0 errors backend + frontend

---

## 16. Migration Checklist (Combined)

1. ☐ Create `PeriodDefinition` entity + DbSet + migration
2. ☐ Create `Room` entity + `RoomType` enum + DbSet + migration
3. ☐ Create `CurriculumContract` entity + DbSet + migration
4. ☐ Create `TeacherSubjectLink` entity + DbSet + migration
5. ☐ Rename `ClassSection` → `Group` across Domain + all references
6. ☐ Add `RequiredRoomType` to `Subject`
7. ☐ Add `MaxPeriodsPerDay`, `MaxPeriodsPerWeek` to `TeacherProfile`
8. ☐ Add `WorkingDays` (DayOfWeekFlag) to `SchoolTenant`
9. ☐ Add `GroupId` to `TimetableVersion`; add unique constraint
10. ☐ Modify `TimetableEntry`: add RoomId FK, PeriodDefinitionId FK; remove StartTime, EndTime, Room string, ClassSectionId, GradeId
11. ☐ Rename `ClassSectionId` → `GroupId` in: StudentAssignment, SupervisorScope, AttendanceRecord
12. ☐ Remove `TeacherAssignment` entity + DbSet
13. ☐ Implement all 8 validation rules in `TimetableService.ValidateForPublicationAsync`
14. ☐ Implement new services: PeriodDefinitionService, RoomService, CurriculumService, TeacherSubjectLinkService
15. ☐ Register new services in DependencyInjection.cs
16. ☐ Implement new controllers: PeriodDefinitionsController, RoomsController, CurriculumController, TeacherSubjectLinksController
17. ☐ Update TimetableController with new endpoints
18. ☐ Update AssignmentsController (remove teacher endpoints)
19. ☐ Update DashboardService to query published timetable entries
20. ☐ Update AttendanceService to validate against published timetable
21. ☐ Update all DTOs (rename ClassSection→Group, new DTOs)
22. ☐ Update DatabaseSeeder with new entities and renamed references
23. ☐ Frontend: new model files, new services, new components
24. ☐ Frontend: rename ClassSection→Group in all models, services, components
25. ☐ Frontend: redesign TimetableComponent with grid builder + validation UI
26. ☐ Frontend: update sidebar navigation
27. ☐ Build verification: 0 errors backend + frontend
28. ☐ Attendance: Add `SubmissionStatus` enum + `AttendanceEditPermission` entity + `GracePeriodMinutes` + new `AuditAction` values
29. ☐ Attendance: Extend `AttendanceRecord` with new fields
30. ☐ Attendance: Update DTOs + service interface + controller endpoints
31. ☐ Attendance: Rewrite `SubmitAttendanceAsync` with full validation
32. ☐ Attendance: Implement `UpdateAttendanceAsync` (edit protocol)
33. ☐ Attendance: Implement `GetSessionComplianceAsync` + edit permission CRUD
34. ☐ Attendance: Frontend role-specific views + parent access
35. ☐ Attendance: Generate migration + update seeder
36. ☐ Build verification: 0 errors backend + frontend
