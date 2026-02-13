# SkillSphere — System Requirements Specification (SRS)
*Version:* 0.1 (Draft)  
*Date:* 2026-02-11  
*Product:* SkillSphere (Parent–School–Student Communication & Weekly Reporting System)

---

## 1. Purpose
This document defines the **System Requirements Specification (SRS)** for **SkillSphere**, a multi-tenant platform that enables schools to manage **academic operations, attendance, weekly reports, and stakeholder communication** between **School Admins, Managers, Teachers (including Supervisors), Parents/Guardians, and Students**.

---

## 2. Scope
SkillSphere provides a **school-specific** configuration layer where each school can:
- Enable/disable features per school (feature flags)
- Configure academic structure (grades, classes/sections, subjects, terms/semesters, departments)
- Manage users and assignments
- Build teacher-based timetables
- Capture attendance and evaluations
- Produce weekly student reports and distribute them through configurable channels (WhatsApp, Email, In-app)
- Track compliance and escalations (including internal-only teacher → supervisor reporting)

**Out of scope (initially):**
- Full LMS content delivery (courses/lessons)
- Online exams engine (unless explicitly added later)
- Payments/fees module
- Transportation/bus module

---

## 3. Definitions & Glossary
- **Tenant / School:** A single school instance with isolated data and configuration.
- **Semester / Term:** A time boundary for assignments, timetables, and reports.
- **Class/Section:** A physical or logical classroom group (e.g., 1/2, 4A).
- **Department:** A subject group unit (e.g., Math Department) used for supervisor scope.
- **Teacher Supervisor:** A teacher who has extra oversight permissions in a defined scope (subject/grade/department/classes/semester).
- **Weekly Report:** A structured report submitted by teachers, per student, per subject, per week, bounded by semester.
- **Internal Report:** Internal-only teacher-to-supervisor/manager/admin report (not visible to parents/students).
- **Feature Flags:** School-level enable/disable toggles for system modules.

---

## 4. Stakeholders
- **Platform Owner / Vendor**
- **Platform Super Admin (Vendor Ops)**
- **School Admin (School Owner)**
- **School Manager (Operations)**
- **Teacher**
- **Teacher Supervisor (Head of Department / Grade Leader)**
- **Parent/Guardian**
- **Student**

---

## 5. System Overview
### 5.1 Product Goals
1. Provide a safe, auditable communication and reporting channel between school and families.
2. Reduce operational chaos from WhatsApp groups/spreadsheets by centralizing:
   - attendance
   - weekly reports
   - notifications
   - compliance tracking
3. Allow each school to tailor feature availability without impacting other schools.

### 5.2 Key Principles
- **School-configurable** (feature flags + structure).
- **Role-based access** with optional supervisor overlays.
- **Semester-bound data** (assignments, timetable versions, reports).
- **Auditability** for compliance and dispute resolution.

---

## 6. User Roles & Permissions (High Level)
### 6.1 Platform Super Admin (Platform-level)
- Onboards schools (create tenant)
- Creates initial School Admin
- Platform-wide configuration, integrations, and support access (with strict audit)

### 6.2 School Admin (School-level Owner)
- Full control inside one school
- Manages feature flags, structure, roles, workflows
- Can appoint supervisors and define scopes

### 6.3 School Manager (Operations)
- Builds timetables, manages assignments, monitors compliance
- Executes daily user operations per permissions granted by School Admin

### 6.4 Teacher
- Views timetable
- Records attendance
- Submits grades/notes/behavioral feedback
- Submits weekly reports (if enabled)
- Submits internal reports/escalations

### 6.5 Teacher Supervisor (Teacher+)
- Oversight within scope (department/grade/subject/classes/semester)
- Reviews internal reports and (optionally) weekly reports quality checks
- Escalates to School Manager/Admin

### 6.6 Parent/Guardian
- Read-only access to student performance artifacts (as enabled)
- Receives notifications (as configured)
- May message teachers if messaging is enabled (optional policy)

### 6.7 Student (Optional)
- Read-only access to grades/feedback/reports (as enabled)

---

## 7. Dashboards (Role-Based)
### 7.1 School Admin Dashboard
Must include:
- School health overview: attendance completion %, weekly report completion %, late submissions
- Compliance heatmap: by grade/class/department/teacher
- Escalation insights: internal reports count, unresolved items
- Feature flags status summary
- Notification delivery status (WhatsApp/Email/In-app)

### 7.2 School Manager Dashboard
Must include:
- Action list: missing attendance, missing weekly reports, timetable conflicts
- Teacher compliance tracker (weekly)
- Student risk queue (from internal reports)
- Semester/timetable version status
- User activation/deactivation queue (if permitted)

### 7.3 Teacher Dashboard
Must include:
- Today’s timetable
- Attendance tasks due
- Weekly report tasks due (by class/subject)
- Student list per assigned class/subject
- Escalation submission shortcut (internal report)

### 7.4 Teacher Supervisor Dashboard
Must include:
- Scope filter (department/grade/subject/classes)
- Internal reports inbox (triage, assign, escalate)
- Compliance and quality alerts in scope (optional feature)
- Trending students list (frequent concerns)

### 7.5 Parent Dashboard
Must include:
- Student card(s) (multi-child support)
- Weekly reports timeline
- Grades/notes/behavior overview
- Notifications preferences (if allowed)
- Download/export (PDF) (optional)

### 7.6 Student Dashboard (Optional)
Must include:
- Grades & feedback
- Weekly reports (read-only)
- Trends view (simple)

---

## 8. User Scenarios (Use Cases)
### UC-01: School Admin enables weekly reports and WhatsApp distribution
**Actor:** School Admin  
**Preconditions:** School tenant exists; School Admin authenticated  
**Main flow:**
1. Admin opens Feature Management.
2. Enables Weekly Reports.
3. Enables WhatsApp Notifications.
4. Sets report distribution recipients: Parent + Manager + Admin + Teacher copy.
5. Saves configuration.
**Postconditions:** Weekly reports and WhatsApp channel are active for this school.

### UC-02: School Manager creates a semester timetable with conflict validation
**Actor:** School Manager  
**Preconditions:** Academic structure exists (grades/classes/subjects), teachers exist  
**Main flow:**
1. Manager selects semester.
2. Adds timetable entries (teacher + class + subject + time slot).
3. System validates conflicts (teacher overlaps, class overlaps).
4. Manager publishes timetable version.
**Postconditions:** Teachers can view assigned timetable for the semester.

### UC-03: Teacher records attendance for a class session
**Actor:** Teacher  
**Preconditions:** Teacher has timetable entry for the session  
**Main flow:**
1. Teacher opens Today’s sessions.
2. Selects class/subject session.
3. Marks students Present/Absent/Late (as enabled).
4. Submits attendance.
**Postconditions:** Attendance stored; compliance status updated.

### UC-04: Teacher submits weekly report for a student (subject-based)
**Actor:** Teacher  
**Preconditions:** Weekly reports feature enabled; teacher assigned to subject/class  
**Main flow:**
1. Teacher opens weekly report tasks.
2. Selects student + subject + week.
3. Enters grades/notes/behavior attributes (school-configured).
4. Submits.
**Postconditions:** Report created; distribution queue prepared.

### UC-05: Teacher submits internal-only concern to supervisor (student risk)
**Actor:** Teacher  
**Preconditions:** Supervisor assigned for relevant scope  
**Main flow:**
1. Teacher opens Internal Report.
2. Selects category: student risk/behavior/academic/operational.
3. Adds details and attachments (optional).
4. Submits; system routes to supervisor inbox.
**Postconditions:** Internal report visible only to authorized staff; audit logged.

### UC-06: Supervisor escalates internal report to School Manager
**Actor:** Teacher Supervisor  
**Main flow:**
1. Supervisor reviews internal report.
2. Adds decision notes.
3. Escalates to School Manager.
**Postconditions:** School Manager notified; case status updated.

### UC-07: Parent views weekly reports and progress trends
**Actor:** Parent  
**Preconditions:** Parent linked to student; parent access enabled  
**Main flow:**
1. Parent opens student profile.
2. Views weekly report timeline and summary.
3. Filters by subject/teacher/term.
**Postconditions:** Read-only access; view event logged (optional).

---

## 9. Functional Requirements (Software User Requirements)
> Format: **FR-###** (Functional Requirement)

### 9.1 Tenant & Feature Management
- **FR-001** The system shall support **multi-tenant** schools with isolated data per tenant.
- **FR-002** The system shall allow School Admin to **enable/disable** features per school.
- **FR-003** The system shall support feature flags including: Attendance, Weekly Reports, Performance Attributes, Parent Access, Student Access, WhatsApp, Email, In-app Notifications.
- **FR-004** Disabling a feature shall prevent access to related screens/APIs for that tenant.

### 9.2 User & Role Management
- **FR-010** The system shall allow School Admin to create/edit/deactivate School Managers, Teachers, Students.
- **FR-011** The system shall allow linking **Parent/Guardian** to one or more students.
- **FR-012** The system shall support role-based permissions: School Admin, School Manager, Teacher, Parent, Student.
- **FR-013** The system shall support **Teacher Supervisor** as an overlay role on Teacher with scope rules.
- **FR-014** The system shall allow School Admin to define School Manager permissions (permission templates).

### 9.3 Academic Structure
- **FR-020** The system shall allow School Admin to configure Grades, Terms/Semesters, Classes/Sections, Subjects.
- **FR-021** The system shall allow School Admin to configure Departments for supervisor scope mapping.
- **FR-022** Academic structure configurations shall be scoped to a single school tenant.

### 9.4 Semester Assignments
- **FR-030** The system shall support semester-based student assignment to exactly one Grade and one Class.
- **FR-031** The system shall support semester-based teacher assignments to multiple subjects/classes/grades.
- **FR-032** The system shall allow reassignment of teachers and students per semester by School Manager (if permitted).
- **FR-033** The system shall support optional approval workflow by School Admin for reassignments.

### 9.5 Timetable
- **FR-040** The system shall allow School Manager to create teacher-based timetable entries including: subject, class, grade, time slot, semester.
- **FR-041** The system shall validate timetable conflicts (teacher overlap and class overlap).
- **FR-042** The system shall support timetable versioning per semester and publishing.
- **FR-043** Teachers shall only see timetable entries assigned to them.

### 9.6 Attendance
- **FR-050** The system shall allow Teachers to submit attendance for their assigned sessions.
- **FR-051** The system shall allow School Manager/Admin to monitor attendance completion.
- **FR-052** The system shall support attendance reminder alarms based on configurable rules (e.g., 7 days, 14 days) per school policy.

### 9.7 Evaluation, Grades, Attributes
- **FR-060** The system shall allow Teachers to add grades, notes, and behavioral feedback per student per subject per semester.
- **FR-061** The system shall allow School Admin to configure which performance attributes apply (optional).
- **FR-062** The system shall enforce attribute availability by school configuration.

### 9.8 Weekly Reports
- **FR-070** The system shall allow School Admin to enable/disable weekly reports per school.
- **FR-071** The system shall allow Teachers to submit weekly reports that are student-specific, subject-based, semester-bound, and week-bound.
- **FR-072** The system shall distribute weekly reports to configured recipients (parents, students optional, manager, admin, teacher copy, supervisor copy).
- **FR-073** The system shall prevent parents/students from editing reports.

### 9.9 Internal Reporting (Teacher → Supervisor/Management)
- **FR-080** The system shall allow Teachers to submit internal reports categorized by: student risk, behavior, academic concern, operational issue.
- **FR-081** Internal reports shall be visible only to authorized roles (Supervisor/Manager/Admin) based on scope and policy.
- **FR-082** The system shall support escalation workflow and status tracking for internal reports.
- **FR-083** The system shall maintain audit logs for all internal report actions.

### 9.10 Notifications
- **FR-090** The system shall support notifications via WhatsApp, Email, and In-app (per tenant configuration).
- **FR-091** The system shall support notification templates per event type (weekly report delivered, attendance missing, escalation update).
- **FR-092** The system shall record delivery status and failures per channel.

### 9.11 Dashboards & Analytics
- **FR-100** The system shall provide dashboards per role as defined in Section 7.
- **FR-101** The system shall compute compliance metrics: attendance completion %, weekly report completion %, late submissions.
- **FR-102** The system shall provide filtering by grade/class/department/teacher/semester.
- **FR-103** The system shall provide trend views for parents/students (simple).

### 9.12 Access Control
- **FR-110** The system shall enforce authorization based on role and scope (for supervisors).
- **FR-111** Teachers shall only access students/classes/subjects assigned to them in the current semester.
- **FR-112** Parents shall only access data for linked students.
- **FR-113** Student access shall be disabled by default and enabled by School Admin (policy).

### 9.13 Audit & Compliance
- **FR-120** The system shall log audit events for: logins, role changes, feature flag changes, report submissions, internal report actions, notification sends.
- **FR-121** The system shall provide an audit search for School Admin (role-limited).

---

## 10. Non-Functional Requirements (NFR)
- **NFR-001 Security:** All communication shall use TLS; passwords must be hashed; support MFA (future).
- **NFR-002 Privacy:** Tenant isolation; role-limited access; minimal data exposure to parents/students.
- **NFR-003 Availability:** Target 99.5% uptime for MVP; graceful degradation when WhatsApp/Email providers fail.
- **NFR-004 Performance:** Dashboards should load within 3 seconds under normal school load.
- **NFR-005 Usability:** Mobile-first parent experience; Arabic/English localization readiness.
- **NFR-006 Auditability:** All sensitive actions must be logged and tamper-resistant (append-only storage preferred).
- **NFR-007 Scalability:** Support multiple schools; horizontal scaling for notification workload.

---

## 11. Data & Entities (Conceptual)
Minimum entities:
- SchoolTenant, FeatureFlag
- User, Role, Permission, SupervisorScope
- Student, ParentLink
- Grade, ClassSection, Subject, Department
- Semester/Term
- TeacherAssignment, StudentAssignment
- TimetableVersion, TimetableEntry
- AttendanceRecord
- GradeRecord, Note, BehaviorFeedback, PerformanceAttributeDefinition
- WeeklyReport, WeeklyReportItem
- InternalReport, InternalReportComment, InternalReportStatus
- NotificationEvent, NotificationDeliveryLog
- AuditLog

---

## 12. External Integrations (Optional/Pluggable)
- WhatsApp provider (e.g., Business API)
- Email provider (SMTP or API)
- Future: SIS import/export, PDF reports

---

## 13. Acceptance Criteria (MVP)
MVP is acceptable when:
1. A school can be onboarded, configured, and staffed.
2. School Manager can publish a semester timetable with conflict checks.
3. Teachers can record attendance for assigned sessions.
4. Teachers can submit weekly reports and parents can view them.
5. Internal reporting works with supervisor routing and escalation.
6. Dashboards show compliance and basic analytics for admin/manager.

---

---

## Appendix A — Stakeholder Requirements (Captured from Chat)
This appendix incorporates the detailed requirements provided by stakeholders and refines them to match real school operations where **some teachers act as supervisors** (e.g., Head of Department / Grade Leader).

### A.1 Actors & Roles (Detailed)
#### A.1.1 School Admin (School-level Owner)
The School Admin is the top authority inside a single school and is fully responsible for:
- Enabling / disabling features for their school (**controls what features exist and how they are used**)
- Managing academic structure
- Approving workflows
- Delegating operational work to School Managers
- Appointing **Teacher Supervisors** and defining their scope (department/grade/subject/classes/semester)

#### A.1.2 School Manager (Operations)
School Managers do the operational work, delegated by the School Admin.
Responsibilities:
- Daily operations
- Assignments and semester mapping
- Timetables
- Monitoring compliance
- Escalations

Limitations:
- Cannot change feature availability
- Cannot change core school rules unless explicitly allowed by School Admin

#### A.1.3 Teacher
Responsible for:
- Teaching
- Attendance
- Grades
- Reports
- Internal escalation to supervisors/managers/admin (as configured)

#### A.1.4 Teacher Supervisor (Teacher+ Overlay)
Some teachers act as supervisors (department heads, grade leaders). They:
- Receive internal reports from teachers within scope
- Review, comment, and escalate to School Manager/Admin
- Monitor compliance/quality within scope (optional)

#### A.1.5 Student (Read-only, Optional)
Consumers of:
- Grades
- Feedback
- Reports (read-only)

#### A.1.6 Parent / Guardian
Stakeholders who:
- Monitor performance
- Receive reports
- Communicate through reports and/or allowed channels

---

### A.2 Core Administrative Setup (School Admin)
#### A.2.1 Feature Management (**VERY IMPORTANT**)
School Admin can enable/disable features per school, such as:
- Attendance tracking
- Weekly reports
- Performance attributes
- Student access
- Parent access
- WhatsApp notifications
- Email notifications

**Rationale:** Enables per-school customization without platform-wide impact.

#### A.2.2 User Management
School Admin can:
- Add, edit, deactivate:
  - School Managers
  - Teachers
  - Students
- Link parents to students
- Define what School Managers are allowed to do (permission templates)
- Define supervisor scopes and privileges

School Manager can:
- Execute daily user operations
- Activate / deactivate users
- Handle assignments (within allowed permissions)

#### A.2.3 Academic Structure Configuration (School-Level)
School Admin defines (school-scoped):
- Grades (e.g., Egyptian system: 1/1, 1/2, 1/3)
- Terms / Semesters
- Classes (Rooms / Sections)
- Subjects
- Departments (to support teacher-supervisor structures)

#### A.2.4 Assignment Rules (Semester-Based)
Students (changeable per semester) are assigned to:
- One grade
- One class
- Multiple subjects

Teachers (changeable per semester) can teach:
- Multiple subjects
- Multiple classes
- Multiple grades

Teachers can be reassigned:
- Within the same semester
- Across different semesters

Reassignment is handled by:
- School Manager
- With optional approval by School Admin (school policy)

---

### A.3 Timetable & Teaching Flow
#### A.3.1 Timetable Management
Handled by School Manager, governed by School Admin.

Each timetable entry is teacher-based and links:
- Subject
- Class
- Grade
- Time slot
- Semester (and timetable version)

Supports:
- Reassignment
- Conflict validation
- Semester versioning

#### A.3.2 Teacher Access Rules
Teachers can:
- View timetable
- Record attendance
- Interact only with assigned classes and subjects

---

### A.4 Teacher Responsibilities
#### A.4.1 Student Evaluation
Teachers can add:
- Grades
- Notes
- Behavioral feedback

#### A.4.2 Performance Attributes (Configurable)
Each school can choose which attributes apply:
- Academic performance
- Behavior
- Participation
- Communication skills
- Activities

All attributes are optional and school-controlled.

#### A.4.3 Weekly Reporting
Weekly reports are enabled/disabled by School Admin.
Reports are:
- Student-specific
- Subject-based
- Semester-bound
- Submitted only by teachers

#### A.4.4 Report Distribution (Recipients + Channels)
Reports can be sent to:
- Parents
- Students (optional)
- School Manager
- School Admin
- Teacher copy
- Supervisor copy (if applicable)

Channels (configurable per school):
- WhatsApp
- Email
- System dashboard

#### A.4.5 Teacher → Supervisor Reporting (**Internal Only**)
Teachers can submit internal reports to:
- Teacher Supervisors
- School Managers
- School Admin

Use cases:
- Student risks
- Behavioral issues
- Academic concerns
- Operational problems

These reports are:
- Internal only
- Not visible to parents or students
- Audited and traceable (status + escalation chain)

---

### A.5 Monitoring & Control
#### A.5.1 Compliance Tracking
School Managers track:
- Report submission completion
- Attendance completion
- Teacher compliance

School Admin monitors:
- Overall performance
- Repeated violations
- Escalations

Teacher Supervisors (if enabled) monitor compliance inside their scope.

---

### A.6 Parent Experience
Parents can:
- View weekly reports
- Track progress over time
- View grades, notes, behavioral feedback

---

### A.7 Student Experience (Optional)
Students can:
- View grades
- View feedback
- Track trends
- Read reports (read-only)

---

### A.8 Reporting & Analytics
School Admin & Managers can view dashboards for:
- Teacher performance
- Student trends
- Class comparisons
- Compliance metrics

---

### A.9 Access Control Summary (Stakeholder View)
| Role | Authority |
|------|----------|
| School Admin | Full control inside school |
| School Manager | Operational execution |
| Teacher Supervisor (Teacher+) | Oversight within scope |
| Teacher | Academic execution |
| Parent | Read-only |
| Student | Read-only (optional) |


## 14. Open Decisions (Track as BA)
- Parent ↔ Teacher messaging rules (enabled/disabled, moderation, allowed hours)
- Supervisor review: mandatory vs optional quality checks
- Report format: fixed template vs school-defined fields
- Data retention policy and exports
