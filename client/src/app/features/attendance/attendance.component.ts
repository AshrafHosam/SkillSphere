import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AssignmentService } from '@core/services/data.service';
import { AuthService } from '@core/services/auth.service';
import { TeacherAssignmentDto, StudentAssignmentDto, AttendanceRecordDto, SubmitAttendanceRequest, AttendanceEntryRequest } from '@core/models';
import { AttendanceStatus } from '@core/models/enums';

interface StudentEntry {
  studentProfileId: string;
  studentName: string;
  status: AttendanceStatus;
  notes: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Attendance</h1>
      <div class="tab-buttons" *ngIf="isTeacher">
        <button [class.active]="mode==='submit'" (click)="mode='submit'">Submit Attendance</button>
        <button [class.active]="mode==='view'" (click)="mode='view'">View Records</button>
      </div>
    </div>

    <!-- ========== TEACHER: SUBMIT ATTENDANCE ========== -->
    <ng-container *ngIf="isTeacher && mode==='submit'">
      <div class="card">
        <h3>Submit Attendance</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Assignment (Subject / Class)</label>
            <select [(ngModel)]="selectedAssignmentId" (ngModelChange)="onAssignmentChange()">
              <option value="">-- Select --</option>
              <option *ngFor="let a of teacherAssignments" [value]="a.id">
                {{a.subjectName}} — {{a.gradeName}} / {{a.classSectionName}} ({{a.semesterName}})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="submitDate" (ngModelChange)="checkExistingAttendance()" />
          </div>
          <div class="form-group">
            <label>Session Time (optional)</label>
            <input type="time" [(ngModel)]="submitSessionTime" />
          </div>
        </div>
      </div>

      <div class="card info-card" *ngIf="alreadySubmitted">
        <p class="info-msg">Attendance for this class/subject/date has already been submitted.</p>
      </div>

      <div class="card" *ngIf="studentEntries.length && !alreadySubmitted">
        <div class="bulk-actions">
          <span class="student-count">{{studentEntries.length}} students</span>
          <button class="btn-sm" (click)="markAll('Present')">All Present</button>
          <button class="btn-sm" (click)="markAll('Absent')">All Absent</button>
        </div>
        <table class="data-table">
          <thead><tr><th>Student</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            <tr *ngFor="let s of studentEntries; let i = index">
              <td class="student-name">{{s.studentName}}</td>
              <td>
                <div class="status-buttons">
                  <button *ngFor="let st of statuses" [class]="'status-btn badge-' + st.toLowerCase()"
                    [class.selected]="s.status === st" (click)="s.status = st">{{st}}</button>
                </div>
              </td>
              <td><input type="text" [(ngModel)]="s.notes" placeholder="Optional notes" class="notes-input" /></td>
            </tr>
          </tbody>
        </table>
        <div class="submit-bar">
          <button class="btn-primary" (click)="submitAttendance()" [disabled]="submitting">
            {{submitting ? 'Submitting...' : 'Submit Attendance'}}
          </button>
        </div>
      </div>

      <div class="card" *ngIf="submitSuccess">
        <p class="success-msg">Attendance submitted successfully!</p>
      </div>
      <div class="card" *ngIf="submitError">
        <p class="error-msg">{{submitError}}</p>
      </div>
    </ng-container>

    <!-- ========== VIEW ATTENDANCE RECORDS ========== -->
    <ng-container *ngIf="!isTeacher || mode==='view'">
      <div class="card">
        <div class="form-grid">
          <div class="form-group"><label>Date</label><input type="date" [(ngModel)]="filterDate" /></div>
          <div class="form-group" style="align-self:end"><button class="btn-primary" (click)="loadAttendance()">Load</button></div>
        </div>
      </div>

      <div class="card" *ngIf="records.length">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Subject</th><th>Class</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            <tr *ngFor="let r of records">
              <td>{{r.studentName}}</td><td>{{r.subjectName}}</td><td>{{r.classSectionName}}</td>
              <td><span [class]="'badge-' + r.status.toLowerCase()">{{r.status}}</span></td>
              <td>{{r.notes}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card" *ngIf="!records.length && filterDate">
        <p>No attendance records for this date.</p>
      </div>
    </ng-container>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:.75rem}.page-header h1{margin:0}
    .tab-buttons{display:flex;gap:.5rem}
    .tab-buttons button{padding:.5rem 1rem;border:1px solid #e2e8f0;border-radius:6px;background:white;cursor:pointer;font-size:.875rem}
    .tab-buttons button.active{background:#0f172a;color:white;border-color:#0f172a}
    .btn-primary{padding:.5rem 1.25rem;background:#0f172a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.875rem}
    .btn-primary:disabled{opacity:.6;cursor:not-allowed}
    .btn-sm{padding:.25rem .75rem;border:1px solid #e2e8f0;border-radius:4px;cursor:pointer;font-size:.8rem;background:white}
    .card{background:#fff;padding:1.5rem;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:1rem}
    .card h3{margin:0 0 1rem;color:#0f172a}
    .form-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;align-items:end}
    .form-group{margin-bottom:.5rem}.form-group label{display:block;margin-bottom:.25rem;font-weight:600;font-size:.875rem;color:#334155}
    .form-group input,.form-group select{width:100%;padding:.5rem;border:1px solid #e2e8f0;border-radius:4px;box-sizing:border-box;font-size:.875rem}
    .bulk-actions{display:flex;align-items:center;gap:.75rem;margin-bottom:1rem;padding-bottom:.75rem;border-bottom:1px solid #f1f5f9}
    .student-count{font-weight:600;color:#64748b;font-size:.875rem}
    .data-table{width:100%;border-collapse:collapse}.data-table th,.data-table td{padding:.75rem;text-align:left;border-bottom:1px solid #e2e8f0}
    .data-table th{font-weight:600;color:#64748b;font-size:.8rem;text-transform:uppercase}
    .student-name{font-weight:500}
    .status-buttons{display:flex;gap:.25rem}
    .status-btn{padding:.25rem .5rem;border:2px solid transparent;border-radius:6px;cursor:pointer;font-size:.75rem;font-weight:600;opacity:.5;transition:all .15s}
    .status-btn.selected{opacity:1;border-color:#0f172a;transform:scale(1.05)}
    .badge-present,.badge-Present{background:#dcfce7;color:#166534}
    .badge-absent,.badge-Absent{background:#fef2f2;color:#991b1b}
    .badge-late,.badge-Late{background:#fef3c7;color:#92400e}
    .badge-excused,.badge-Excused{background:#f1f5f9;color:#475569}
    .notes-input{padding:.35rem .5rem;border:1px solid #e2e8f0;border-radius:4px;width:100%;box-sizing:border-box;font-size:.8rem}
    .submit-bar{display:flex;justify-content:flex-end;margin-top:1rem;padding-top:1rem;border-top:1px solid #f1f5f9}
    .success-msg{color:#166534;font-weight:600;margin:0}.error-msg{color:#991b1b;font-weight:600;margin:0}
    .info-card{background:#eff6ff}.info-msg{color:#1e40af;font-weight:500;margin:0}
  `]
})
export class AttendanceComponent implements OnInit {
  // View mode
  records: AttendanceRecordDto[] = [];
  filterDate = '';

  // Submit mode (teacher)
  mode: 'submit' | 'view' = 'submit';
  isTeacher = false;
  teacherAssignments: TeacherAssignmentDto[] = [];
  selectedAssignmentId = '';
  submitDate = '';
  submitSessionTime = '';
  studentEntries: StudentEntry[] = [];
  statuses = [AttendanceStatus.Present, AttendanceStatus.Absent, AttendanceStatus.Late, AttendanceStatus.Excused];
  submitting = false;
  submitSuccess = false;
  submitError = '';
  alreadySubmitted = false;

  constructor(
    private attendanceSvc: AttendanceService,
    private assignmentSvc: AssignmentService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.filterDate = today;
    this.submitDate = today;

    const role = this.auth.userRole;
    this.isTeacher = role === 'Teacher';

    if (this.isTeacher) {
      this.mode = 'submit';
      const profileId = this.auth.profileId;
      if (profileId) {
        this.assignmentSvc.getTeacherAssignments({ teacherId: profileId }).subscribe(
          a => this.teacherAssignments = a.filter(x => x.isActive)
        );
      }
    } else {
      this.mode = 'view';
    }
  }

  onAssignmentChange() {
    this.studentEntries = [];
    this.submitSuccess = false;
    this.submitError = '';
    this.alreadySubmitted = false;
    if (!this.selectedAssignmentId) return;

    const assignment = this.teacherAssignments.find(a => a.id === this.selectedAssignmentId);
    if (!assignment) return;

    // Load students in this class+semester
    this.assignmentSvc.getStudentAssignments({
      classId: assignment.classSectionId,
      semesterId: assignment.semesterId
    }).subscribe(students => {
      this.studentEntries = students
        .filter(s => s.isActive)
        .map(s => ({
          studentProfileId: s.studentProfileId,
          studentName: s.studentName,
          status: AttendanceStatus.Present,
          notes: ''
        }));
      this.checkExistingAttendance();
    });
  }

  checkExistingAttendance() {
    if (!this.selectedAssignmentId || !this.submitDate) return;
    const assignment = this.teacherAssignments.find(a => a.id === this.selectedAssignmentId);
    if (!assignment) return;

    this.attendanceSvc.getAttendance(this.submitDate, assignment.classSectionId, assignment.subjectId).subscribe(
      existing => { this.alreadySubmitted = existing.length > 0; },
      () => { this.alreadySubmitted = false; }
    );
  }

  markAll(status: string) {
    const s = status as AttendanceStatus;
    this.studentEntries.forEach(e => e.status = s);
  }

  submitAttendance() {
    if (!this.selectedAssignmentId || this.studentEntries.length === 0) return;
    const assignment = this.teacherAssignments.find(a => a.id === this.selectedAssignmentId);
    if (!assignment) return;

    this.submitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    const request: SubmitAttendanceRequest = {
      subjectId: assignment.subjectId,
      classSectionId: assignment.classSectionId,
      semesterId: assignment.semesterId,
      date: this.submitDate,
      sessionTime: this.submitSessionTime || undefined,
      entries: this.studentEntries.map(e => ({
        studentProfileId: e.studentProfileId,
        status: e.status,
        notes: e.notes || undefined
      }))
    };

    this.attendanceSvc.submit(this.auth.profileId!, request).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = true;
        this.alreadySubmitted = true;
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.message || err?.error?.detail || 'Failed to submit attendance. Please try again.';
      }
    });
  }

  loadAttendance() {
    this.attendanceSvc.getAttendance(this.filterDate).subscribe(r => this.records = r);
  }
}
