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
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white/90">Dashboard</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">Welcome back, {{ auth.fullName }}</p>
    </div>

    <!-- Admin / SuperAdmin Dashboard -->
    <div *ngIf="auth.userRole === 'SchoolAdmin' || auth.userRole === 'PlatformSuperAdmin'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Teachers</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ adminData?.totalTeachers || 0 }}</h3>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Students</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ adminData?.totalStudents || 0 }}</h3>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Parents</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ adminData?.totalParents || 0 }}</h3>
      </div>
      <div *ngIf="(adminData?.openEscalations || 0) > 0" class="rounded-2xl border border-error-200 bg-error-50 p-5 dark:border-error-800 dark:bg-error-500/10">
        <p class="mb-1 text-sm text-error-600 dark:text-error-400">Open Escalations</p>
        <h3 class="text-2xl font-bold text-error-600 dark:text-error-400">{{ adminData?.openEscalations }}</h3>
      </div>
      <div *ngIf="adminData?.unresolvedInternalReports" class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Unresolved Reports</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ adminData?.unresolvedInternalReports }}</h3>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Notifications Delivered</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ adminData?.notificationStatus?.delivered || 0 }}</h3>
      </div>
    </div>

    <!-- Manager Dashboard -->
    <div *ngIf="auth.userRole === 'SchoolManager'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="card-base" [ngClass]="(managerData?.missingAttendance || 0) > 0 ? 'card-error' : 'card-default'">
        <p class="mb-1 text-sm" [ngClass]="(managerData?.missingAttendance || 0) > 0 ? 'text-error-600 dark:text-error-400' : 'text-gray-500 dark:text-gray-400'">Missing Attendance</p>
        <h3 class="text-2xl font-bold" [ngClass]="(managerData?.missingAttendance || 0) > 0 ? 'text-error-600 dark:text-error-400' : 'text-gray-800 dark:text-white/90'">{{ managerData?.missingAttendance || 0 }}</h3>
      </div>
      <div class="card-base" [ngClass]="(managerData?.missingWeeklyReports || 0) > 0 ? 'card-error' : 'card-default'">
        <p class="mb-1 text-sm" [ngClass]="(managerData?.missingWeeklyReports || 0) > 0 ? 'text-error-600 dark:text-error-400' : 'text-gray-500 dark:text-gray-400'">Missing Weekly Reports</p>
        <h3 class="text-2xl font-bold" [ngClass]="(managerData?.missingWeeklyReports || 0) > 0 ? 'text-error-600 dark:text-error-400' : 'text-gray-800 dark:text-white/90'">{{ managerData?.missingWeeklyReports || 0 }}</h3>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Timetable Conflicts</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ managerData?.timetableConflicts || 0 }}</h3>
      </div>
      <div class="card-base" [ngClass]="(managerData?.studentRiskQueue || 0) > 0 ? 'card-warning' : 'card-default'">
        <p class="mb-1 text-sm" [ngClass]="(managerData?.studentRiskQueue || 0) > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-500 dark:text-gray-400'">Students at Risk</p>
        <h3 class="text-2xl font-bold" [ngClass]="(managerData?.studentRiskQueue || 0) > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-800 dark:text-white/90'">{{ managerData?.studentRiskQueue || 0 }}</h3>
      </div>
    </div>

    <!-- Teacher Dashboard -->
    <div *ngIf="auth.userRole === 'Teacher'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Today's Sessions</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ teacherData?.todaySessions?.length || 0 }}</h3>
      </div>
      <div class="card-base" [ngClass]="(teacherData?.attendanceTasksDue || 0) > 0 ? 'card-warning' : 'card-default'">
        <p class="mb-1 text-sm" [ngClass]="(teacherData?.attendanceTasksDue || 0) > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-500 dark:text-gray-400'">Attendance Due</p>
        <h3 class="text-2xl font-bold" [ngClass]="(teacherData?.attendanceTasksDue || 0) > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-800 dark:text-white/90'">{{ teacherData?.attendanceTasksDue || 0 }}</h3>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Reports Due</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ teacherData?.weeklyReportTasksDue || 0 }}</h3>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">My Students</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ teacherData?.totalAssignedStudents || 0 }}</h3>
      </div>
    </div>

    <!-- Today's Schedule (Teacher) -->
    <div *ngIf="auth.userRole === 'Teacher' && teacherData?.todaySessions?.length" class="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div class="px-5 py-4"><h3 class="text-base font-semibold text-gray-800 dark:text-white/90">Today's Schedule</h3></div>
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800">
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Time</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Subject</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Class</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Room</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Attendance</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr *ngFor="let s of teacherData!.todaySessions" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td class="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ s.startTime }} - {{ s.endTime }}</td>
              <td class="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{{ s.subjectName }}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ s.gradeName }} {{ s.className }}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ s.room || '-' }}</td>
              <td class="px-5 py-3 text-sm">
                <span class="badge" [ngClass]="s.attendanceSubmitted ? 'badge-success' : 'badge-warning'">
                  {{ s.attendanceSubmitted ? 'Done' : 'Pending' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Supervisor Dashboard -->
    <div *ngIf="auth.userRole === 'TeacherSupervisor'" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="card-base" [ngClass]="(supervisorData?.internalReportsInbox || 0) > 0 ? 'card-warning' : 'card-default'">
        <p class="mb-1 text-sm" [ngClass]="(supervisorData?.internalReportsInbox || 0) > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-500 dark:text-gray-400'">Reports Inbox</p>
        <h3 class="text-2xl font-bold" [ngClass]="(supervisorData?.internalReportsInbox || 0) > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-800 dark:text-white/90'">{{ supervisorData?.internalReportsInbox || 0 }}</h3>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Compliance Alerts</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ supervisorData?.complianceAlerts || 0 }}</h3>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Trending Students</p>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ supervisorData?.trendingStudents?.length || 0 }}</h3>
      </div>
    </div>

    <!-- Trending Students list (Supervisor) -->
    <div *ngIf="auth.userRole === 'TeacherSupervisor' && supervisorData?.trendingStudents?.length" class="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div class="px-5 py-4"><h3 class="text-base font-semibold text-gray-800 dark:text-white/90">Trending Students (Multiple Reports)</h3></div>
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800">
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Report Count</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Latest Category</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr *ngFor="let s of supervisorData!.trendingStudents" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td class="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{{ s.studentName }}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ s.reportCount }}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ s.latestCategory }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Parent Dashboard -->
    <div *ngIf="auth.userRole === 'Parent'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div *ngFor="let child of parentData?.studentCards || []" class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white/90">{{ child.studentName }}</h3>
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">{{ child.gradeName }} - {{ child.className }}</p>
        <div class="flex gap-6">
          <div class="text-center">
            <span class="block text-xl font-bold text-gray-800 dark:text-white/90">{{ child.totalWeeklyReports }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">Reports</span>
          </div>
          <div class="text-center">
            <span class="block text-xl font-bold text-gray-800 dark:text-white/90">{{ child.averageGrade ? (child.averageGrade | number:'1.0-1') : 'N/A' }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">Avg Score</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Dashboard -->
    <div *ngIf="auth.userRole === 'Student'" class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 class="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">Student Portal</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">Welcome to your student dashboard. Check your weekly reports and attendance from the navigation menu.</p>
    </div>

    <!-- Loading state -->
    <div *ngIf="loading" class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <p class="text-sm text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
    </div>
  `,
  styles: []
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
