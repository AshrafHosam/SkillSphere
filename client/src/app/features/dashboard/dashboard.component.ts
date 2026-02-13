import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { DashboardService } from '@core/services/data.service';
import { AdminDashboardDto, ManagerDashboardDto, TeacherDashboardDto, SupervisorDashboardDto, ParentDashboardDto } from '@core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome back, {{ auth.fullName }}</p>
    </div>

    <!-- Admin / SuperAdmin Dashboard -->
    <div *ngIf="auth.userRole === 'SchoolAdmin' || auth.userRole === 'PlatformSuperAdmin'" class="dashboard-grid">
      <div class="card stat-card">
        <h3>{{ adminData?.totalTeachers || 0 }}</h3>
        <p>Teachers</p>
      </div>
      <div class="card stat-card">
        <h3>{{ adminData?.totalStudents || 0 }}</h3>
        <p>Students</p>
      </div>
      <div class="card stat-card">
        <h3>{{ adminData?.totalParents || 0 }}</h3>
        <p>Parents</p>
      </div>
      <div class="card stat-card alert" *ngIf="(adminData?.openEscalations || 0) > 0">
        <h3>{{ adminData?.openEscalations }}</h3>
        <p>Open Escalations</p>
      </div>
      <div class="card stat-card" *ngIf="adminData?.unresolvedInternalReports">
        <h3>{{ adminData?.unresolvedInternalReports }}</h3>
        <p>Unresolved Reports</p>
      </div>
      <div class="card stat-card">
        <h3>{{ adminData?.notificationStatus?.delivered || 0 }}</h3>
        <p>Notifications Delivered</p>
      </div>
    </div>

    <!-- Manager Dashboard -->
    <div *ngIf="auth.userRole === 'SchoolManager'" class="dashboard-grid">
      <div class="card stat-card" [class.alert]="(managerData?.missingAttendance || 0) > 0">
        <h3>{{ managerData?.missingAttendance || 0 }}</h3>
        <p>Missing Attendance</p>
      </div>
      <div class="card stat-card" [class.alert]="(managerData?.missingWeeklyReports || 0) > 0">
        <h3>{{ managerData?.missingWeeklyReports || 0 }}</h3>
        <p>Missing Weekly Reports</p>
      </div>
      <div class="card stat-card">
        <h3>{{ managerData?.timetableConflicts || 0 }}</h3>
        <p>Timetable Conflicts</p>
      </div>
      <div class="card stat-card" [class.alert]="(managerData?.studentRiskQueue || 0) > 0">
        <h3>{{ managerData?.studentRiskQueue || 0 }}</h3>
        <p>Students at Risk</p>
      </div>
    </div>

    <!-- Teacher Dashboard -->
    <div *ngIf="auth.userRole === 'Teacher'" class="dashboard-grid">
      <div class="card stat-card">
        <h3>{{ teacherData?.todaySessions?.length || 0 }}</h3>
        <p>Today's Sessions</p>
      </div>
      <div class="card stat-card" [class.alert]="(teacherData?.attendanceTasksDue || 0) > 0">
        <h3>{{ teacherData?.attendanceTasksDue || 0 }}</h3>
        <p>Attendance Due</p>
      </div>
      <div class="card stat-card">
        <h3>{{ teacherData?.weeklyReportTasksDue || 0 }}</h3>
        <p>Reports Due</p>
      </div>
      <div class="card stat-card">
        <h3>{{ teacherData?.totalAssignedStudents || 0 }}</h3>
        <p>My Students</p>
      </div>
    </div>

    <!-- Today's Schedule (Teacher) -->
    <div *ngIf="auth.userRole === 'Teacher' && teacherData?.todaySessions?.length" class="card" style="margin-top:1rem">
      <h3>Today's Schedule</h3>
      <table class="data-table">
        <thead><tr><th>Time</th><th>Subject</th><th>Class</th><th>Room</th><th>Attendance</th></tr></thead>
        <tbody>
          <tr *ngFor="let s of teacherData!.todaySessions">
            <td>{{ s.startTime }} - {{ s.endTime }}</td>
            <td>{{ s.subjectName }}</td>
            <td>{{ s.gradeName }} {{ s.className }}</td>
            <td>{{ s.room || '-' }}</td>
            <td><span [class]="s.attendanceSubmitted ? 'badge-done' : 'badge-pending'">{{ s.attendanceSubmitted ? 'Done' : 'Pending' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Supervisor Dashboard -->
    <div *ngIf="auth.userRole === 'TeacherSupervisor'" class="dashboard-grid">
      <div class="card stat-card" [class.alert]="(supervisorData?.internalReportsInbox || 0) > 0">
        <h3>{{ supervisorData?.internalReportsInbox || 0 }}</h3>
        <p>Reports Inbox</p>
      </div>
      <div class="card stat-card">
        <h3>{{ supervisorData?.complianceAlerts || 0 }}</h3>
        <p>Compliance Alerts</p>
      </div>
      <div class="card stat-card">
        <h3>{{ supervisorData?.trendingStudents?.length || 0 }}</h3>
        <p>Trending Students</p>
      </div>
    </div>

    <!-- Trending Students list (Supervisor) -->
    <div *ngIf="auth.userRole === 'TeacherSupervisor' && supervisorData?.trendingStudents?.length" class="card" style="margin-top:1rem">
      <h3>Trending Students (Multiple Reports)</h3>
      <table class="data-table">
        <thead><tr><th>Student</th><th>Report Count</th><th>Latest Category</th></tr></thead>
        <tbody>
          <tr *ngFor="let s of supervisorData!.trendingStudents">
            <td>{{ s.studentName }}</td>
            <td>{{ s.reportCount }}</td>
            <td>{{ s.latestCategory }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Parent Dashboard -->
    <div *ngIf="auth.userRole === 'Parent'" class="dashboard-grid">
      <div class="card" *ngFor="let child of parentData?.studentCards || []">
        <h3>{{ child.studentName }}</h3>
        <p class="meta">{{ child.gradeName }} - {{ child.className }}</p>
        <div class="child-stats">
          <div><strong>{{ child.totalWeeklyReports }}</strong><span>Reports</span></div>
          <div><strong>{{ child.averageGrade ? (child.averageGrade | number:'1.0-1') : 'N/A' }}</strong><span>Avg Score</span></div>
        </div>
      </div>
    </div>

    <!-- Student Dashboard -->
    <div *ngIf="auth.userRole === 'Student'" class="card">
      <h3>Student Portal</h3>
      <p>Welcome to your student dashboard. Check your weekly reports and attendance from the navigation menu.</p>
    </div>

    <!-- Loading state -->
    <div *ngIf="loading" class="card">
      <p>Loading dashboard data...</p>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { margin: 0 0 0.25rem; color: #0f172a; }
    .page-header p { color: #64748b; margin: 0; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
    .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-card h3 { font-size: 2rem; margin: 0 0 0.25rem; color: #0f172a; }
    .stat-card p { margin: 0; color: #64748b; font-size: 0.875rem; }
    .stat-card.alert { border-left: 4px solid #ef4444; }
    .stat-card.alert h3 { color: #dc2626; }
    .meta { color: #64748b; font-size: 0.875rem; margin: 0.25rem 0 1rem; }
    .child-stats { display: flex; gap: 2rem; margin-top: 1rem; }
    .child-stats div { text-align: center; }
    .child-stats strong { display: block; font-size: 1.5rem; color: #0f172a; }
    .child-stats span { font-size: 0.75rem; color: #64748b; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { font-weight: 600; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
    .badge-done { background: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }
    .badge-pending { background: #fef3c7; color: #92400e; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }
  `]
})
export class DashboardComponent implements OnInit {
  adminData: AdminDashboardDto | null = null;
  managerData: ManagerDashboardDto | null = null;
  teacherData: TeacherDashboardDto | null = null;
  supervisorData: SupervisorDashboardDto | null = null;
  parentData: ParentDashboardDto | null = null;
  loading = false;

  constructor(public auth: AuthService, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    const role = this.auth.userRole;
    const profileId = this.auth.profileId;
    this.loading = true;

    if (role === 'SchoolAdmin' || role === 'PlatformSuperAdmin') {
      this.dashboardService.getAdminDashboard().subscribe({
        next: d => { this.adminData = d; this.loading = false; },
        error: () => this.loading = false
      });
    } else if (role === 'SchoolManager') {
      this.dashboardService.getManagerDashboard().subscribe({
        next: d => { this.managerData = d; this.loading = false; },
        error: () => this.loading = false
      });
    } else if (role === 'Teacher' && profileId) {
      this.dashboardService.getTeacherDashboard(profileId).subscribe({
        next: d => { this.teacherData = d; this.loading = false; },
        error: () => this.loading = false
      });
    } else if (role === 'TeacherSupervisor' && profileId) {
      this.dashboardService.getSupervisorDashboard(profileId).subscribe({
        next: d => { this.supervisorData = d; this.loading = false; },
        error: () => this.loading = false
      });
    } else if (role === 'Parent' && profileId) {
      this.dashboardService.getParentDashboard(profileId).subscribe({
        next: d => { this.parentData = d; this.loading = false; },
        error: () => this.loading = false
      });
    } else {
      this.loading = false;
    }
  }
}
