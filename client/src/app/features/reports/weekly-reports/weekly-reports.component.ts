import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeeklyReportService, AssignmentService } from '@core/services/data.service';
import { AuthService } from '@core/services/auth.service';
import { LocalDatePipe } from '@core/pipes/local-date.pipe';
import { TeacherAssignmentDto, StudentAssignmentDto, WeeklyReportDto, CreateWeeklyReportRequest, WeeklyReportItemRequest } from '@core/models';

interface ReportItemEntry {
  attributeName: string;
  value: string;
  numericValue: number | null;
  comments: string;
}

@Component({
  selector: 'app-weekly-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LocalDatePipe],
  template: `
    <div class="mb-6 flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-white/90">Weekly Reports</h1>
    </div>

    <!-- ====== CREATE REPORT FORM (Teacher only) ====== -->
    <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="isTeacher">
      <div class="flex cursor-pointer items-center justify-between" (click)="showCreateForm=!showCreateForm">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white/90">+ Create Weekly Report</h3>
        <span class="text-gray-400">{{showCreateForm ? '▲' : '▼'}}</span>
      </div>
      <div *ngIf="showCreateForm" class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Assignment (Subject / Class)</label>
            <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="createForm.assignmentId" (ngModelChange)="onCreateAssignmentChange()">
              <option value="">-- Select --</option>
              <option *ngFor="let a of teacherAssignments" [value]="a.id">
                {{a.subjectName}} — {{a.gradeName}} / {{a.classSectionName}} ({{a.semesterName}})
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Student</label>
            <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="createForm.studentProfileId">
              <option value="">-- Select --</option>
              <option *ngFor="let s of createStudents" [value]="s.studentProfileId">{{s.studentName}}</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Week Number</label>
            <input type="number" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="createForm.weekNumber" min="1" max="52" placeholder="e.g. 12" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Week Start Date</label>
            <input type="date" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="createForm.weekStartDate" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Week End Date</label>
            <input type="date" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="createForm.weekEndDate" />
          </div>
        </div>

        <div class="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="text-base font-semibold text-gray-800 dark:text-white/90">Report Items</h4>
            <button class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" (click)="addItem()">+ Add Item</button>
          </div>
          <div class="mb-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900" *ngFor="let item of createForm.items; let i = index">
            <div class="grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-end mb-2">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Attribute</label>
                <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="item.attributeName">
                  <option value="">-- Select --</option>
                  <option *ngFor="let attr of defaultAttributes" [value]="attr">{{attr}}</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Value</label>
                <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="item.value">
                  <option value="">-- Select --</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Score (0-10)</label>
                <input type="number" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="item.numericValue" min="0" max="10" />
              </div>
              <button class="text-error-500 hover:text-error-600 text-lg" (click)="removeItem(i)" title="Remove">✕</button>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Comments</label>
              <input type="text" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="item.comments" placeholder="Optional comments for this attribute" />
            </div>
          </div>
          <p class="text-xs italic text-gray-400 dark:text-gray-500" *ngIf="!createForm.items.length">Click "+ Add Item" to add report attributes (e.g., Academic Performance, Behavior, Homework).</p>
        </div>

        <div class="mt-4 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
          <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60" (click)="createReport()" [disabled]="createSubmitting">
            {{createSubmitting ? 'Saving...' : 'Save as Draft'}}
          </button>
        </div>
        <p *ngIf="createSuccess" class="mt-3 text-sm font-semibold text-success-600 dark:text-success-400">Weekly report created as draft!</p>
        <p *ngIf="createError" class="mt-3 text-sm font-semibold text-error-600 dark:text-error-400">{{createError}}</p>
      </div>
    </div>

    <!-- ====== REPORTS LIST ====== -->
    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mb-4">
      <div class="overflow-x-auto"><table class="w-full table-auto">
        <thead><tr class="border-b border-gray-100 dark:border-gray-800">
          <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
          <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Teacher</th>
          <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Week</th>
          <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Period</th>
          <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
          <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
        </tr></thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr *ngFor="let r of reports" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.studentName}}</td>
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.teacherName}}</td>
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">Week {{r.weekNumber}}</td>
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.weekStartDate | localDate:'shortDate'}} - {{r.weekEndDate | localDate:'shortDate'}}</td>
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
              <span class="badge"
                [ngClass]="{
                  'badge-warning': r.status === 'Draft',
                  'badge-success': r.status === 'Submitted' || r.status === 'Reviewed',
                  'badge-gray': r.status === 'Distributed'
                }">{{r.status}}</span>
            </td>
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
              <div class="flex gap-2">
                <button class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" (click)="viewReport(r)">View</button>
                <button class="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600" *ngIf="isTeacher && r.status === 'Draft'" (click)="submitReport(r)">Submit</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!reports.length"><td colspan="6" class="px-5 py-8 text-center text-sm text-gray-400">No weekly reports found.</td></tr>
        </tbody>
      </table></div>
    </div>

    <!-- ====== REPORT DETAIL VIEW ====== -->
    <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="selectedReport">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white/90">Report Details — {{selectedReport.studentName}} — Week {{selectedReport.weekNumber}}</h3>
        <button class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" (click)="selectedReport=null">Close</button>
      </div>
      <p class="mt-3 text-sm text-gray-700 dark:text-gray-300"><strong>Subject:</strong> {{selectedReport.subjectName}} | <strong>Teacher:</strong> {{selectedReport.teacherName}} | <strong>Status:</strong> {{selectedReport.status}}</p>
      <div *ngFor="let item of selectedReport.items" class="mb-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h4 class="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">{{item.attributeName}}</h4>
        <p *ngIf="item.value" class="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Value:</strong> {{item.value}}</p>
        <p *ngIf="item.numericValue != null" class="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Score:</strong> {{item.numericValue}}</p>
        <p *ngIf="item.comments" class="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Comments:</strong> {{item.comments}}</p>
      </div>
    </div>
  `,
  styles: []
})
export class WeeklyReportsComponent implements OnInit {
  reports: WeeklyReportDto[] = [];
  selectedReport: WeeklyReportDto | null = null;
  isTeacher = false;
  teacherAssignments: TeacherAssignmentDto[] = [];
  createStudents: StudentAssignmentDto[] = [];

  showCreateForm = false;
  createForm = {
    assignmentId: '',
    studentProfileId: '',
    weekNumber: 1,
    weekStartDate: '',
    weekEndDate: '',
    items: [] as ReportItemEntry[]
  };
  createSubmitting = false;
  createSuccess = false;
  createError = '';

  defaultAttributes = [
    'Academic Performance',
    'Homework Completion',
    'Class Participation',
    'Behavior & Discipline',
    'Attendance & Punctuality',
    'Social Skills',
    'Creativity',
    'Physical Education',
    'Reading',
    'Writing'
  ];

  constructor(
    private reportSvc: WeeklyReportService,
    private assignmentSvc: AssignmentService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.isTeacher = this.auth.userRole === 'Teacher';
    this.reportSvc.getReports().subscribe(r => this.reports = r.items || []);

    if (this.isTeacher) {
      const profileId = this.auth.profileId;
      if (profileId) {
        this.assignmentSvc.getTeacherAssignments({ teacherId: profileId }).subscribe(
          a => this.teacherAssignments = a.filter(x => x.isActive)
        );
      }
      // Pre-populate current week info
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      this.createForm.weekStartDate = monday.toISOString().split('T')[0];
      this.createForm.weekEndDate = friday.toISOString().split('T')[0];

      // Calculate week number
      const start = new Date(now.getFullYear(), 0, 1);
      const diff = now.getTime() - start.getTime();
      this.createForm.weekNumber = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
    }
  }

  onCreateAssignmentChange() {
    this.createStudents = [];
    this.createForm.studentProfileId = '';
    if (!this.createForm.assignmentId) return;
    const assignment = this.teacherAssignments.find(a => a.id === this.createForm.assignmentId);
    if (!assignment) return;
    this.assignmentSvc.getStudentAssignments({ classId: assignment.classSectionId, semesterId: assignment.semesterId })
      .subscribe(s => this.createStudents = s.filter(x => x.isActive));
  }

  addItem() {
    this.createForm.items.push({ attributeName: '', value: '', numericValue: null, comments: '' });
  }

  removeItem(index: number) {
    this.createForm.items.splice(index, 1);
  }

  createReport() {
    const assignment = this.teacherAssignments.find(a => a.id === this.createForm.assignmentId);
    if (!assignment || !this.createForm.studentProfileId || this.createForm.items.length === 0) {
      this.createError = 'Please fill in assignment, student, and at least one report item.';
      return;
    }

    this.createSubmitting = true;
    this.createSuccess = false;
    this.createError = '';

    const req: CreateWeeklyReportRequest = {
      studentProfileId: this.createForm.studentProfileId,
      subjectId: assignment.subjectId,
      semesterId: assignment.semesterId,
      weekNumber: this.createForm.weekNumber,
      weekStartDate: this.createForm.weekStartDate,
      weekEndDate: this.createForm.weekEndDate,
      items: this.createForm.items
        .filter(i => i.attributeName)
        .map(i => ({
          attributeName: i.attributeName,
          value: i.value || undefined,
          numericValue: i.numericValue ?? undefined,
          comments: i.comments || undefined
        }))
    };

    this.reportSvc.create(this.auth.profileId!, req).subscribe({
      next: (report) => {
        this.createSubmitting = false;
        this.createSuccess = true;
        this.reports = [report, ...this.reports];
        // Reset items but keep assignment/week context
        this.createForm.studentProfileId = '';
        this.createForm.items = [];
      },
      error: (err) => {
        this.createSubmitting = false;
        this.createError = err?.error?.message || err?.error?.detail || 'Failed to create weekly report.';
      }
    });
  }

  submitReport(report: WeeklyReportDto) {
    this.reportSvc.submit(report.id).subscribe({
      next: () => {
        report.status = 'Submitted' as any;
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to submit report.');
      }
    });
  }

  viewReport(report: WeeklyReportDto) {
    this.reportSvc.getById(report.id).subscribe(r => this.selectedReport = r);
  }
}
