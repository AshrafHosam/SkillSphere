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
    <div class="page-header"><h1>Internal Reports</h1></div>

    <!-- ====== CREATE REPORT FORM (Teacher only) ====== -->
    <div class="card form-card" *ngIf="isTeacher">
      <div class="form-header" (click)="showCreateForm=!showCreateForm">
        <h3>+ Create Internal Report</h3>
        <span class="toggle">{{showCreateForm ? '▲' : '▼'}}</span>
      </div>
      <div *ngIf="showCreateForm" class="form-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Category</label>
            <select [(ngModel)]="createForm.category">
              <option value="">-- Select --</option>
              <option *ngFor="let c of categories" [value]="c">{{c}}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Student (optional — select class first)</label>
            <select [(ngModel)]="createForm.assignmentId" (ngModelChange)="onCreateAssignmentChange()">
              <option value="">-- Select class --</option>
              <option *ngFor="let a of teacherAssignments" [value]="a.id">
                {{a.subjectName}} — {{a.gradeName}} / {{a.classSectionName}}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <select [(ngModel)]="createForm.studentProfileId">
              <option value="">-- Select student --</option>
              <option *ngFor="let s of createStudents" [value]="s.studentProfileId">{{s.studentName}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Title</label>
          <input type="text" [(ngModel)]="createForm.title" placeholder="Brief summary of the issue" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="createForm.description" rows="4" placeholder="Detailed description of the report..."></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-primary" (click)="createReport()" [disabled]="createSubmitting">
            {{createSubmitting ? 'Submitting...' : 'Submit Report'}}
          </button>
        </div>
        <p *ngIf="createSuccess" class="success-msg">Internal report created!</p>
        <p *ngIf="createError" class="error-msg">{{createError}}</p>
      </div>
    </div>

    <!-- ====== REPORTS LIST ====== -->
    <div class="card">
      <table class="data-table">
        <thead><tr><th>Title</th><th>Category</th><th>Reporter</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of reports">
            <td>{{r.title}}</td><td>{{r.category}}</td><td>{{r.reporterName}}</td>
            <td><span [class]="'badge-' + statusClass(r.status)">{{r.status}}</span></td>
            <td>{{r.createdAt | localDate:'mediumDate'}}</td>
            <td><button class="btn-sm" (click)="viewReport(r)">View</button></td>
          </tr>
          <tr *ngIf="!reports.length"><td colspan="6" class="empty-row">No internal reports found.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ====== REPORT DETAIL ====== -->
    <div class="card" *ngIf="selectedReport">
      <div class="detail-header">
        <h3>{{selectedReport.title}}</h3>
        <button class="btn-sm" (click)="selectedReport=null">Close</button>
      </div>
      <p class="meta">{{selectedReport.category}} | {{selectedReport.status}} | Reporter: {{selectedReport.reporterName}}</p>
      <p *ngIf="selectedReport.studentName"><strong>Student:</strong> {{selectedReport.studentName}}</p>
      <p>{{selectedReport.description}}</p>

      <h4>Comments</h4>
      <div *ngFor="let c of selectedReport.comments" class="comment">
        <strong>{{c.authorName}}</strong> <small>{{c.createdAt | localDate:'short'}}</small>
        <p>{{c.content}}</p>
      </div>

      <div class="form-group" style="margin-top:1rem">
        <textarea [(ngModel)]="newComment" rows="3" placeholder="Add a comment..."></textarea>
        <button class="btn-primary" (click)="addComment()" style="margin-top:.5rem">Add Comment</button>
      </div>

      <div class="action-buttons" *ngIf="selectedReport.status !== 'Resolved' && selectedReport.status !== 'Closed'">
        <button class="btn-sm btn-warning" (click)="escalate()">Escalate</button>
        <button class="btn-sm btn-success" (click)="resolve()">Resolve</button>
      </div>
    </div>
  `,
  styles: [`
    .page-header{margin-bottom:1.5rem}.page-header h1{margin:0}
    .card{background:#fff;padding:1.5rem;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:1rem}
    .form-card{border:1px solid #e2e8f0}
    .form-header{display:flex;justify-content:space-between;align-items:center;cursor:pointer}
    .form-header h3{margin:0;color:#0f172a;font-size:1rem}.toggle{color:#64748b}
    .form-body{margin-top:1rem;padding-top:1rem;border-top:1px solid #f1f5f9}
    .form-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:.75rem}
    .form-group{margin-bottom:.75rem}.form-group label{display:block;margin-bottom:.25rem;font-weight:600;font-size:.875rem;color:#334155}
    .form-group input,.form-group select,.form-group textarea{width:100%;padding:.5rem;border:1px solid #e2e8f0;border-radius:4px;box-sizing:border-box;font-size:.875rem}
    .form-group textarea{resize:vertical}
    .form-actions{display:flex;justify-content:flex-end;margin-top:.5rem}
    .btn-primary{padding:.5rem 1.25rem;background:#0f172a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.875rem}
    .btn-primary:disabled{opacity:.6;cursor:not-allowed}
    .btn-sm{padding:.25rem .75rem;border:1px solid #e2e8f0;border-radius:4px;cursor:pointer;font-size:.8rem;background:white;margin-right:.25rem}
    .btn-warning{background:#f59e0b;color:white;border:none}.btn-success{background:#22c55e;color:white;border:none}
    .data-table{width:100%;border-collapse:collapse}.data-table th,.data-table td{padding:.75rem;text-align:left;border-bottom:1px solid #e2e8f0}
    .data-table th{font-weight:600;color:#64748b;font-size:.8rem;text-transform:uppercase}
    .badge-open{background:#dbeafe;color:#1e40af;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
    .badge-inprogress{background:#fef3c7;color:#92400e;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
    .badge-escalated{background:#fef2f2;color:#991b1b;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
    .badge-resolved{background:#dcfce7;color:#166534;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
    .detail-header{display:flex;justify-content:space-between;align-items:center}
    .detail-header h3{margin:0}
    .meta{color:#64748b;font-size:.875rem;margin-bottom:1rem}
    .comment{padding:.75rem;background:#f8fafc;border-radius:6px;margin-bottom:.5rem}
    .comment p{margin:.25rem 0 0;font-size:.875rem}.comment small{color:#94a3b8;margin-left:.5rem}
    .form-group textarea{resize:vertical}
    .action-buttons{display:flex;gap:.5rem;margin-top:1rem}
    .empty-row{text-align:center;color:#94a3b8;font-style:italic}
    .success-msg{color:#166534;font-weight:600;margin:.5rem 0 0}.error-msg{color:#991b1b;font-weight:600;margin:.5rem 0 0}
  `]
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
