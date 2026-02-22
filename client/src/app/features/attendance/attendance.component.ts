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
    <div class="mb-6 flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-white/90">Attendance</h1>
      <div class="flex gap-2" *ngIf="isTeacher">
        <button (click)="mode='submit'"
          [ngClass]="mode==='submit' ? 'tab-active' : 'tab-inactive'">Submit Attendance</button>
        <button (click)="mode='view'"
          [ngClass]="mode==='view' ? 'tab-active' : 'tab-inactive'">View Records</button>
      </div>
    </div>

    <!-- ========== TEACHER: SUBMIT ATTENDANCE ========== -->
    <ng-container *ngIf="isTeacher && mode==='submit'">
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Submit Attendance</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Assignment (Subject / Class)</label>
            <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="selectedAssignmentId" (ngModelChange)="onAssignmentChange()">
              <option value="">-- Select --</option>
              <option *ngFor="let a of teacherAssignments" [value]="a.id">
                {{a.subjectName}} — {{a.gradeName}} / {{a.classSectionName}} ({{a.semesterName}})
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Date</label>
            <input type="date" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="submitDate" (ngModelChange)="checkExistingAttendance()" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Session Time (optional)</label>
            <input type="time" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="submitSessionTime" />
          </div>
        </div>
      </div>

      <div class="mb-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-500/10" *ngIf="alreadySubmitted">
        <p class="text-sm font-medium text-brand-700 dark:text-brand-300">Attendance for this class/subject/date has already been submitted.</p>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="studentEntries.length && !alreadySubmitted">
        <div class="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
          <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">{{studentEntries.length}} students</span>
          <button class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" (click)="markAll('Present')">All Present</button>
          <button class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" (click)="markAll('Absent')">All Absent</button>
        </div>
        <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="overflow-x-auto"><table class="w-full table-auto">
            <thead><tr class="border-b border-gray-100 dark:border-gray-800">
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes</th>
            </tr></thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let s of studentEntries; let i = index" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <td class="px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">{{s.studentName}}</td>
                <td class="px-5 py-3">
                  <div class="flex gap-1">
                    <button *ngFor="let st of statuses" (click)="s.status = st"
                      class="status-btn"
                      [ngClass]="s.status === st
                        ? (st === 'Present' ? 'status-btn-success'
                          : st === 'Absent' ? 'status-btn-error'
                          : st === 'Late' ? 'status-btn-warning'
                          : 'status-btn-gray')
                        : 'status-btn-inactive'">{{st}}</button>
                  </div>
                </td>
                <td class="px-5 py-3">
                  <input type="text" [(ngModel)]="s.notes" placeholder="Optional notes" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
                </td>
              </tr>
            </tbody>
          </table></div>
        </div>
        <div class="mt-4 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
          <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60" (click)="submitAttendance()" [disabled]="submitting">
            {{submitting ? 'Submitting...' : 'Submit Attendance'}}
          </button>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="submitSuccess">
        <p class="text-sm font-semibold text-success-600 dark:text-success-400">Attendance submitted successfully!</p>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="submitError">
        <p class="text-sm font-semibold text-error-600 dark:text-error-400">{{submitError}}</p>
      </div>
    </ng-container>

    <!-- ========== VIEW ATTENDANCE RECORDS ========== -->
    <ng-container *ngIf="!isTeacher || mode==='view'">
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Date</label>
            <input type="date" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="filterDate" />
          </div>
          <div class="self-end">
            <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600" (click)="loadAttendance()">Load</button>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="records.length">
        <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="overflow-x-auto"><table class="w-full table-auto">
            <thead><tr class="border-b border-gray-100 dark:border-gray-800">
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Subject</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Class</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes</th>
            </tr></thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let r of records" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.studentName}}</td>
                <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.subjectName}}</td>
                <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.classSectionName}}</td>
                <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                  <span class="badge"
                    [ngClass]="{
                      'badge-success': r.status.toLowerCase() === 'present',
                      'badge-error': r.status.toLowerCase() === 'absent',
                      'badge-warning': r.status.toLowerCase() === 'late',
                      'badge-gray': r.status.toLowerCase() === 'excused'
                    }">{{r.status}}</span>
                </td>
                <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.notes}}</td>
              </tr>
            </tbody>
          </table></div>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="!records.length && filterDate">
        <p class="text-sm text-gray-400">No attendance records for this date.</p>
      </div>
    </ng-container>
  `,
  styles: []
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
