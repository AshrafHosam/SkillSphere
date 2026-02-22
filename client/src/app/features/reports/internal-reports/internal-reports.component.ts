import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InternalReportService, AssignmentService, UserService } from '@core/services/data.service';
import { AuthService } from '@core/services/auth.service';
import { LocalDatePipe } from '@core/pipes/local-date.pipe';
import { TeacherAssignmentDto, StudentAssignmentDto, CreateInternalReportRequest } from '@core/models';
import { InternalReportCategory } from '@core/models/enums';

@Component({
  selector: 'app-internal-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LocalDatePipe],
  template: `
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white/90">Internal Reports</h2>
    </div>

    <!-- ====== CREATE REPORT FORM (Teacher only) ====== -->
    <div class="mb-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]" *ngIf="isTeacher">
      <div class="flex cursor-pointer items-center justify-between" (click)="showCreateForm=!showCreateForm">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white/90">+ Create Internal Report</h3>
        <span class="text-gray-400">{{showCreateForm ? '▲' : '▼'}}</span>
      </div>
      <div *ngIf="showCreateForm" class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Category</label>
            <select [(ngModel)]="createForm.category" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
              <option value="">-- Select --</option>
              <option *ngFor="let c of categories" [value]="c">{{c}}</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Student (optional — select class first)</label>
            <select [(ngModel)]="createForm.assignmentId" (ngModelChange)="onCreateAssignmentChange()" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
              <option value="">-- Select class --</option>
              <option *ngFor="let a of teacherAssignments" [value]="a.id">
                {{a.subjectName}} — {{a.gradeName}} / {{a.classSectionName}}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">&nbsp;</label>
            <select [(ngModel)]="createForm.studentProfileId" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
              <option value="">-- Select student --</option>
              <option *ngFor="let s of createStudents" [value]="s.studentProfileId">{{s.studentName}}</option>
            </select>
          </div>
        </div>
        <div class="mb-3">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Title</label>
          <input type="text" [(ngModel)]="createForm.title" placeholder="Brief summary of the issue" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
        </div>
        <div class="mb-3">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Description</label>
          <textarea [(ngModel)]="createForm.description" rows="4" placeholder="Detailed description of the report..." class="w-full resize-y rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"></textarea>
        </div>
        <div class="mt-3 flex justify-end">
          <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60" (click)="createReport()" [disabled]="createSubmitting">
            {{createSubmitting ? 'Submitting...' : 'Submit Report'}}
          </button>
        </div>
        <p *ngIf="createSuccess" class="mt-3 text-sm font-semibold text-success-600 dark:text-success-400">Internal report created!</p>
        <p *ngIf="createError" class="mt-3 text-sm font-semibold text-error-600 dark:text-error-400">{{createError}}</p>
      </div>
    </div>

    <!-- ====== REPORTS LIST ====== -->
    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800">
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Reporter</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Created</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr *ngFor="let r of reports" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.title}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.category}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.reporterName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                <span class="badge" [ngClass]="{
                  'badge-brand': statusClass(r.status) === 'open',
                  'badge-warning': statusClass(r.status) === 'inprogress',
                  'badge-error': statusClass(r.status) === 'escalated',
                  'badge-success': statusClass(r.status) === 'resolved'
                }">{{r.status}}</span>
              </td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.createdAt | localDate:'mediumDate'}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                <button class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" (click)="viewReport(r)">View</button>
              </td>
            </tr>
            <tr *ngIf="!reports.length">
              <td colspan="6" class="px-5 py-8 text-center text-sm text-gray-400">No internal reports found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ====== REPORT DETAIL ====== -->
    <div class="mb-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]" *ngIf="selectedReport">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white/90">{{selectedReport.title}}</h3>
        <button class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" (click)="selectedReport=null">Close</button>
      </div>
      <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">{{selectedReport.category}} | {{selectedReport.status}} | Reporter: {{selectedReport.reporterName}}</p>
      <p *ngIf="selectedReport.studentName" class="text-sm text-gray-700 dark:text-gray-300"><strong class="font-semibold text-gray-800 dark:text-white/90">Student:</strong> {{selectedReport.studentName}}</p>
      <p class="text-sm text-gray-700 dark:text-gray-300">{{selectedReport.description}}</p>

      <h4 class="mt-4 text-sm font-semibold text-gray-800 dark:text-white/90">Comments</h4>
      <div *ngFor="let c of selectedReport.comments" class="mb-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <span class="font-semibold text-gray-800 dark:text-white/90">{{c.authorName}}</span>
        <span class="ml-2 text-xs text-gray-400">{{c.createdAt | localDate:'short'}}</span>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{c.content}}</p>
      </div>

      <div class="mt-4">
        <textarea [(ngModel)]="newComment" rows="3" placeholder="Add a comment..." class="w-full resize-y rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"></textarea>
        <div class="mt-3 flex justify-end">
          <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60" (click)="addComment()">Add Comment</button>
        </div>
      </div>

      <div class="mt-4 flex gap-2" *ngIf="selectedReport.status !== 'Resolved' && selectedReport.status !== 'Closed'">
        <button class="rounded-lg bg-warning-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-warning-600" (click)="escalate()">Escalate</button>
        <button class="rounded-lg bg-success-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-success-600" (click)="resolve()">Resolve</button>
      </div>
    </div>
  `,
  styles: []
})
export class InternalReportsComponent implements OnInit {
  reports: any[] = [];
  selectedReport: any = null;
  newComment = '';
  isTeacher = false;
  teacherAssignments: TeacherAssignmentDto[] = [];
  createStudents: StudentAssignmentDto[] = [];
  categories = Object.values(InternalReportCategory);

  showCreateForm = false;
  createForm = { category: '', assignmentId: '', studentProfileId: '', title: '', description: '' };
  createSubmitting = false;
  createSuccess = false;
  createError = '';

  constructor(
    private reportSvc: InternalReportService,
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

  createReport() {
    if (!this.createForm.category || !this.createForm.title || !this.createForm.description) {
      this.createError = 'Please fill in category, title, and description.';
      return;
    }

    this.createSubmitting = true;
    this.createSuccess = false;
    this.createError = '';

    const req: CreateInternalReportRequest = {
      studentProfileId: this.createForm.studentProfileId || undefined,
      category: this.createForm.category,
      title: this.createForm.title,
      description: this.createForm.description
    };

    this.reportSvc.create(this.auth.profileId!, req).subscribe({
      next: (report) => {
        this.createSubmitting = false;
        this.createSuccess = true;
        this.reports = [report, ...this.reports];
        this.createForm = { category: '', assignmentId: '', studentProfileId: '', title: '', description: '' };
      },
      error: (err) => {
        this.createSubmitting = false;
        this.createError = err?.error?.message || err?.error?.detail || 'Failed to create internal report.';
      }
    });
  }

  viewReport(report: any) {
    this.reportSvc.getById(report.id).subscribe(r => this.selectedReport = r);
  }

  addComment() {
    if (!this.newComment.trim()) return;
    this.reportSvc.addComment(this.selectedReport.id, { content: this.newComment, isDecisionNote: false }).subscribe(() => {
      this.newComment = '';
      this.viewReport(this.selectedReport);
    });
  }

  escalate() {
    const userId = prompt('Escalate to User ID:');
    if (userId) {
      const notes = prompt('Escalation notes (optional):') || '';
      this.reportSvc.escalate(this.selectedReport.id, { escalateToUserId: userId, notes }).subscribe(() => this.viewReport(this.selectedReport));
    }
  }

  resolve() {
    this.reportSvc.resolve(this.selectedReport.id).subscribe(() => this.viewReport(this.selectedReport));
  }

  statusClass(status: string): string {
    const map: any = { Submitted: 'open', UnderReview: 'inprogress', Escalated: 'escalated', Resolved: 'resolved', Closed: 'resolved' };
    return map[status] || 'open';
  }
}
