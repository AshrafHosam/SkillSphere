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
    <!-- Admin / SuperAdmin Dashboard -->
    <div *ngIf="auth.userRole === 'SchoolAdmin' || auth.userRole === 'PlatformSuperAdmin'">
      <div class="row">
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-info">
              <div class="card-icon"><i class="material-icons">person</i></div>
              <p class="card-category">Teachers</p>
              <h3 class="card-title">{{ adminData?.totalTeachers || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">school</i> Active staff members</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-success">
              <div class="card-icon"><i class="material-icons">people</i></div>
              <p class="card-category">Students</p>
              <h3 class="card-title">{{ adminData?.totalStudents || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">groups</i> Enrolled students</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-warning">
              <div class="card-icon"><i class="material-icons">family_restroom</i></div>
              <p class="card-category">Parents</p>
              <h3 class="card-title">{{ adminData?.totalParents || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">verified_user</i> Registered parents</div></div>
          </div>
        </div>
        <div class="col-md-3" *ngIf="(adminData?.openEscalations || 0) > 0">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-danger">
              <div class="card-icon"><i class="material-icons">warning</i></div>
              <p class="card-category">Open Escalations</p>
              <h3 class="card-title">{{ adminData?.openEscalations }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">priority_high</i> Requires attention</div></div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-3" *ngIf="adminData?.unresolvedInternalReports">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-rose">
              <div class="card-icon"><i class="material-icons">report_problem</i></div>
              <p class="card-category">Unresolved Reports</p>
              <h3 class="card-title">{{ adminData?.unresolvedInternalReports }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">pending_actions</i> Awaiting resolution</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-info">
              <div class="card-icon"><i class="material-icons">notifications_active</i></div>
              <p class="card-category">Notifications</p>
              <h3 class="card-title">{{ adminData?.notificationStatus?.delivered || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">check_circle</i> Delivered</div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Manager Dashboard -->
    <div *ngIf="auth.userRole === 'SchoolManager'">
      <div class="row">
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon" [ngClass]="(managerData?.missingAttendance || 0) > 0 ? 'card-header-danger' : 'card-header-success'">
              <div class="card-icon"><i class="material-icons">fact_check</i></div>
              <p class="card-category">Missing Attendance</p>
              <h3 class="card-title">{{ managerData?.missingAttendance || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">today</i> Today's records</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon" [ngClass]="(managerData?.missingWeeklyReports || 0) > 0 ? 'card-header-warning' : 'card-header-success'">
              <div class="card-icon"><i class="material-icons">summarize</i></div>
              <p class="card-category">Missing Reports</p>
              <h3 class="card-title">{{ managerData?.missingWeeklyReports || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">pending</i> Weekly reports due</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-info">
              <div class="card-icon"><i class="material-icons">schedule</i></div>
              <p class="card-category">Timetable Conflicts</p>
              <h3 class="card-title">{{ managerData?.timetableConflicts || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">event_busy</i> Scheduling issues</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon" [ngClass]="(managerData?.studentRiskQueue || 0) > 0 ? 'card-header-danger' : 'card-header-success'">
              <div class="card-icon"><i class="material-icons">health_and_safety</i></div>
              <p class="card-category">Students at Risk</p>
              <h3 class="card-title">{{ managerData?.studentRiskQueue || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">monitor_heart</i> Requires follow-up</div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Teacher Dashboard -->
    <div *ngIf="auth.userRole === 'Teacher'">
      <div class="row">
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-info">
              <div class="card-icon"><i class="material-icons">event</i></div>
              <p class="card-category">Today's Sessions</p>
              <h3 class="card-title">{{ teacherData?.todaySessions?.length || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">schedule</i> Scheduled today</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon" [ngClass]="(teacherData?.attendanceTasksDue || 0) > 0 ? 'card-header-danger' : 'card-header-success'">
              <div class="card-icon"><i class="material-icons">checklist</i></div>
              <p class="card-category">Attendance Due</p>
              <h3 class="card-title">{{ teacherData?.attendanceTasksDue || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">pending_actions</i> Awaiting submission</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-warning">
              <div class="card-icon"><i class="material-icons">description</i></div>
              <p class="card-category">Reports Due</p>
              <h3 class="card-title">{{ teacherData?.weeklyReportTasksDue || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">edit_note</i> Weekly reports pending</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-success">
              <div class="card-icon"><i class="material-icons">people</i></div>
              <p class="card-category">My Students</p>
              <h3 class="card-title">{{ teacherData?.totalAssignedStudents || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">school</i> Assigned students</div></div>
          </div>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div class="row" *ngIf="teacherData?.todaySessions?.length">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header card-header-primary">
              <h4 class="card-title">Today's Schedule</h4>
              <p class="card-category">Your sessions for today</p>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead><tr><th>Time</th><th>Subject</th><th>Class</th><th>Room</th><th>Attendance</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let s of teacherData!.todaySessions">
                      <td>{{ s.startTime }} - {{ s.endTime }}</td>
                      <td>{{ s.subjectName }}</td>
                      <td>{{ s.gradeName }} {{ s.className }}</td>
                      <td>{{ s.room || '-' }}</td>
                      <td><span [class]="s.attendanceSubmitted ? 'badge badge-success' : 'badge badge-warning'">{{ s.attendanceSubmitted ? 'Done' : 'Pending' }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Supervisor Dashboard -->
    <div *ngIf="auth.userRole === 'TeacherSupervisor'">
      <div class="row">
        <div class="col-md-4">
          <div class="card card-stats">
            <div class="card-header card-header-icon" [ngClass]="(supervisorData?.internalReportsInbox || 0) > 0 ? 'card-header-danger' : 'card-header-success'">
              <div class="card-icon"><i class="material-icons">inbox</i></div>
              <p class="card-category">Reports Inbox</p>
              <h3 class="card-title">{{ supervisorData?.internalReportsInbox || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">mail</i> Pending review</div></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-warning">
              <div class="card-icon"><i class="material-icons">gpp_maybe</i></div>
              <p class="card-category">Compliance Alerts</p>
              <h3 class="card-title">{{ supervisorData?.complianceAlerts || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">policy</i> Policy alerts</div></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card card-stats">
            <div class="card-header card-header-icon card-header-info">
              <div class="card-icon"><i class="material-icons">trending_up</i></div>
              <p class="card-category">Trending Students</p>
              <h3 class="card-title">{{ supervisorData?.trendingStudents?.length || 0 }}</h3>
            </div>
            <div class="card-footer"><div class="stats"><i class="material-icons">analytics</i> Multiple reports</div></div>
          </div>
        </div>
      </div>

      <!-- Trending Students Table -->
      <div class="row" *ngIf="supervisorData?.trendingStudents?.length">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header card-header-warning">
              <h4 class="card-title">Trending Students</h4>
              <p class="card-category">Students with multiple reports</p>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Parent Dashboard -->
    <div *ngIf="auth.userRole === 'Parent'">
      <div class="row">
        <div class="col-md-4" *ngFor="let child of parentData?.studentCards || []">
          <div class="card">
            <div class="card-header card-header-info">
              <h4 class="card-title">{{ child.studentName }}</h4>
              <p class="card-category">{{ child.gradeName }} - {{ child.className }}</p>
            </div>
            <div class="card-body">
              <div class="child-stats-row">
                <div class="child-stat">
                  <span class="stat-value">{{ child.totalWeeklyReports }}</span>
                  <span class="stat-label">Reports</span>
                </div>
                <div class="child-stat">
                  <span class="stat-value">{{ child.averageGrade ? (child.averageGrade | number:'1.0-1') : 'N/A' }}</span>
                  <span class="stat-label">Avg Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Dashboard -->
    <div *ngIf="auth.userRole === 'Student'">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header card-header-primary">
              <h4 class="card-title">Student Portal</h4>
              <p class="card-category">Your learning hub</p>
            </div>
            <div class="card-body">
              <p>Welcome to your student dashboard. Check your weekly reports and attendance from the navigation menu.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="row">
      <div class="col-md-12">
        <div class="card"><div class="card-body"><p class="text-muted">Loading dashboard data...</p></div></div>
      </div>
    </div>
  `,
  styles: [`
    .child-stats-row { display: flex; gap: 2rem; justify-content: center; padding: 1rem 0; }
    .child-stat { text-align: center; }
    .child-stat .stat-value { display: block; font-size: 1.75rem; font-weight: 300; color: #3c4858; }
    .child-stat .stat-label { font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.3px; }
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
