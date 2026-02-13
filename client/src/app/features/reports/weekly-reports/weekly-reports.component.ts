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
    <div class="page-header"><h1>Weekly Reports</h1></div>

    <!-- ====== CREATE REPORT FORM (Teacher only) ====== -->
    <div class="card form-card" *ngIf="isTeacher">
      <div class="form-header" (click)="showCreateForm=!showCreateForm">
        <h3>+ Create Weekly Report</h3>
        <span class="toggle">{{showCreateForm ? '▲' : '▼'}}</span>
      </div>
      <div *ngIf="showCreateForm" class="form-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Assignment (Subject / Class)</label>
            <select [(ngModel)]="createForm.assignmentId" (ngModelChange)="onCreateAssignmentChange()">
              <option value="">-- Select --</option>
              <option *ngFor="let a of teacherAssignments" [value]="a.id">
                {{a.subjectName}} — {{a.gradeName}} / {{a.classSectionName}} ({{a.semesterName}})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Student</label>
            <select [(ngModel)]="createForm.studentProfileId">
              <option value="">-- Select --</option>
              <option *ngFor="let s of createStudents" [value]="s.studentProfileId">{{s.studentName}}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Week Number</label>
            <input type="number" [(ngModel)]="createForm.weekNumber" min="1" max="52" placeholder="e.g. 12" />
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Week Start Date</label>
            <input type="date" [(ngModel)]="createForm.weekStartDate" />
          </div>
          <div class="form-group">
            <label>Week End Date</label>
            <input type="date" [(ngModel)]="createForm.weekEndDate" />
          </div>
        </div>

        <div class="items-section">
          <div class="items-header">
            <h4>Report Items</h4>
            <button class="btn-sm" (click)="addItem()">+ Add Item</button>
          </div>
          <div class="item-card" *ngFor="let item of createForm.items; let i = index">
            <div class="item-row">
              <div class="form-group">
                <label>Attribute</label>
                <select [(ngModel)]="item.attributeName">
                  <option value="">-- Select --</option>
                  <option *ngFor="let attr of defaultAttributes" [value]="attr">{{attr}}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Value</label>
                <select [(ngModel)]="item.value">
                  <option value="">-- Select --</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div class="form-group">
                <label>Score (0-10)</label>
                <input type="number" [(ngModel)]="item.numericValue" min="0" max="10" />
              </div>
              <button class="btn-remove" (click)="removeItem(i)" title="Remove">✕</button>
            </div>
            <div class="form-group">
              <label>Comments</label>
              <input type="text" [(ngModel)]="item.comments" placeholder="Optional comments for this attribute" />
            </div>
          </div>
          <p class="hint" *ngIf="!createForm.items.length">Click "+ Add Item" to add report attributes (e.g., Academic Performance, Behavior, Homework).</p>
        </div>

        <div class="form-actions">
          <button class="btn-primary" (click)="createReport()" [disabled]="createSubmitting">
            {{createSubmitting ? 'Saving...' : 'Save as Draft'}}
          </button>
        </div>
        <p *ngIf="createSuccess" class="success-msg">Weekly report created as draft!</p>
        <p *ngIf="createError" class="error-msg">{{createError}}</p>
      </div>
    </div>

    <!-- ====== REPORTS LIST ====== -->
    <div class="card">
      <table class="data-table">
        <thead><tr><th>Student</th><th>Teacher</th><th>Week</th><th>Period</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of reports">
            <td>{{r.studentName}}</td><td>{{r.teacherName}}</td><td>Week {{r.weekNumber}}</td>
            <td>{{r.weekStartDate | localDate:'shortDate'}} - {{r.weekEndDate | localDate:'shortDate'}}</td>
            <td><span [class]="'badge-' + r.status.toLowerCase()">{{r.status}}</span></td>
            <td>
              <button class="btn-sm" (click)="viewReport(r)">View</button>
              <button class="btn-sm btn-submit" *ngIf="isTeacher && r.status === 'Draft'" (click)="submitReport(r)">Submit</button>
            </td>
          </tr>
          <tr *ngIf="!reports.length"><td colspan="6" class="empty-row">No weekly reports found.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ====== REPORT DETAIL VIEW ====== -->
    <div class="card" *ngIf="selectedReport">
      <div class="detail-header">
        <h3>Report Details — {{selectedReport.studentName}} — Week {{selectedReport.weekNumber}}</h3>
        <button class="btn-sm" (click)="selectedReport=null">Close</button>
      </div>
      <p><strong>Subject:</strong> {{selectedReport.subjectName}} | <strong>Teacher:</strong> {{selectedReport.teacherName}} | <strong>Status:</strong> {{selectedReport.status}}</p>
      <div *ngFor="let item of selectedReport.items" class="report-item">
        <h4>{{item.attributeName}}</h4>
        <p *ngIf="item.value"><strong>Value:</strong> {{item.value}}</p>
        <p *ngIf="item.numericValue != null"><strong>Score:</strong> {{item.numericValue}}</p>
        <p *ngIf="item.comments"><strong>Comments:</strong> {{item.comments}}</p>
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
    .form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:.75rem}
    .form-group{margin-bottom:.5rem}.form-group label{display:block;margin-bottom:.25rem;font-weight:600;font-size:.875rem;color:#334155}
    .form-group input,.form-group select,.form-group textarea{width:100%;padding:.5rem;border:1px solid #e2e8f0;border-radius:4px;box-sizing:border-box;font-size:.875rem}
    .items-section{margin-top:.75rem;padding:1rem;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0}
    .items-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}
    .items-header h4{margin:0;color:#0f172a;font-size:.95rem}
    .item-card{padding:.75rem;background:white;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:.5rem}
    .item-row{display:grid;grid-template-columns:1fr 1fr auto auto;gap:.75rem;align-items:end;margin-bottom:.5rem}
    .btn-remove{background:none;border:none;color:#ef4444;cursor:pointer;font-size:1.1rem;padding:.5rem;align-self:end}
    .btn-sm{padding:.25rem .75rem;border:1px solid #e2e8f0;border-radius:4px;cursor:pointer;font-size:.8rem;background:white;margin-right:.25rem}
    .btn-submit{background:#2563eb;color:white;border-color:#2563eb}
    .btn-primary{padding:.5rem 1.25rem;background:#0f172a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.875rem}
    .btn-primary:disabled{opacity:.6;cursor:not-allowed}
    .form-actions{display:flex;justify-content:flex-end;margin-top:.75rem}
    .data-table{width:100%;border-collapse:collapse}.data-table th,.data-table td{padding:.75rem;text-align:left;border-bottom:1px solid #e2e8f0}
    .data-table th{font-weight:600;color:#64748b;font-size:.8rem;text-transform:uppercase}
    .badge-draft{background:#fef3c7;color:#92400e;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
    .badge-submitted{background:#dbeafe;color:#1e40af;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
    .badge-reviewed{background:#dcfce7;color:#166534;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
    .badge-distributed{background:#f3e8ff;color:#6b21a8;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
    .detail-header{display:flex;justify-content:space-between;align-items:center}
    .detail-header h3{margin:0}
    .report-item{padding:1rem;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:.75rem}
    .report-item h4{margin:0 0 .5rem;color:#0f172a}.report-item p{margin:.25rem 0;font-size:.875rem;color:#475569}
    .hint{color:#94a3b8;font-style:italic;font-size:.85rem;margin:.5rem 0}
    .empty-row{text-align:center;color:#94a3b8;font-style:italic}
    .success-msg{color:#166534;font-weight:600;margin:.5rem 0 0}.error-msg{color:#991b1b;font-weight:600;margin:.5rem 0 0}
  `]
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
