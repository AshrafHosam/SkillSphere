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
      <div class="tabs" *ngIf="isTeacher">
        <button class="tab-btn" [class.active]="mode==='submit'" (click)="mode='submit'">Submit Attendance</button>
        <button class="tab-btn" [class.active]="mode==='view'" (click)="mode='view'">View Records</button>
      </div>
    </div>

    <!-- ========== TEACHER: SUBMIT ATTENDANCE ========== -->
    <ng-container *ngIf="isTeacher && mode==='submit'">
      <div class="card">
        <div class="card-header card-header-success">
          <h4 class="card-title">Submit Attendance</h4>
          <p class="card-category">Mark student attendance for a session</p>
        </div>
        <div class="card-body">
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
      </div>

      <div class="alert alert-danger" *ngIf="alreadySubmitted">
        Attendance for this class/subject/date has already been submitted.
      </div>

      <div class="card" *ngIf="studentEntries.length && !alreadySubmitted">
        <div class="card-body">
          <div class="filter-row">
            <span>{{studentEntries.length}} students</span>
            <button class="btn btn-sm btn-success" (click)="markAll('Present')">All Present</button>
            <button class="btn btn-sm btn-danger" (click)="markAll('Absent')">All Absent</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Student</th><th>Status</th><th>Notes</th></tr></thead>
              <tbody>
                <tr *ngFor="let s of studentEntries; let i = index">
                  <td>{{s.studentName}}</td>
                  <td>
                    <div class="status-buttons">
                      <button *ngFor="let st of statuses" [class]="'btn btn-sm badge-' + st.toLowerCase()"
                        [class.selected]="s.status === st" (click)="s.status = st">{{st}}</button>
                    </div>
                  </td>
                  <td><input type="text" [(ngModel)]="s.notes" placeholder="Optional notes" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer" style="text-align:right">
          <button class="btn btn-primary" (click)="submitAttendance()" [disabled]="submitting">
            {{submitting ? 'Submitting...' : 'Submit Attendance'}}
          </button>
        </div>
      </div>

      <div class="alert alert-success" *ngIf="submitSuccess">
        Attendance submitted successfully!
      </div>
      <div class="alert alert-danger" *ngIf="submitError">
        {{submitError}}
      </div>
    </ng-container>

    <!-- ========== VIEW ATTENDANCE RECORDS ========== -->
    <ng-container *ngIf="!isTeacher || mode==='view'">
      <div class="card">
        <div class="card-header card-header-info">
          <h4 class="card-title">Attendance Records</h4>
          <p class="card-category">View submitted attendance</p>
        </div>
        <div class="card-body">
          <div class="filter-row">
            <div class="form-group"><label>Date</label><input type="date" [(ngModel)]="filterDate" /></div>
            <div class="form-group" style="align-self:end"><button class="btn btn-primary" (click)="loadAttendance()">Load</button></div>
          </div>

          <div class="table-responsive" *ngIf="records.length">
            <table class="table">
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

          <div class="empty-row" *ngIf="!records.length && filterDate">
            <p>No attendance records for this date.</p>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    :host { display: block; }
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
