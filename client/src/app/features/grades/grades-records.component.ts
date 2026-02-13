import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradesService, AssignmentService, AcademicService } from '@core/services/data.service';
import { AuthService } from '@core/services/auth.service';
import { LocalDatePipe } from '@core/pipes/local-date.pipe';
import { TeacherAssignmentDto, StudentAssignmentDto, GradeRecordDto, BehaviorFeedbackDto, CreateGradeRecordRequest, CreateBehaviorFeedbackRequest, SemesterDto } from '@core/models';

@Component({
  selector: 'app-grades-records',
  standalone: true,
  imports: [CommonModule, FormsModule, LocalDatePipe],
  template: `
    <div class="page-header"><h1>Grade Records</h1></div>

    <div class="tabs">
      <button [class.active]="tab==='grades'" (click)="tab='grades'">Grade Records</button>
      <button [class.active]="tab==='behavior'" (click)="tab='behavior'">Behavior Feedback</button>
    </div>

    <!-- ====== GRADE RECORDS TAB ====== -->
    <ng-container *ngIf="tab==='grades'">
      <!-- ADD GRADE FORM (Teacher only) -->
      <div class="card form-card" *ngIf="isTeacher">
        <div class="form-header" (click)="showGradeForm=!showGradeForm">
          <h3>+ Add Grade Record</h3>
          <span class="toggle">{{showGradeForm ? '▲' : '▼'}}</span>
        </div>
        <div *ngIf="showGradeForm" class="form-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Assignment (Subject / Class)</label>
              <select [(ngModel)]="gradeForm.assignmentId" (ngModelChange)="onGradeAssignmentChange()">
                <option value="">-- Select --</option>
                <option *ngFor="let a of teacherAssignments" [value]="a.id">
                  {{a.subjectName}} — {{a.gradeName}} / {{a.classSectionName}} ({{a.semesterName}})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Student</label>
              <select [(ngModel)]="gradeForm.studentProfileId">
                <option value="">-- Select --</option>
                <option *ngFor="let s of gradeStudents" [value]="s.studentProfileId">{{s.studentName}}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Assessment Type</label>
              <select [(ngModel)]="gradeForm.assessmentType">
                <option value="">-- Select --</option>
                <option value="Quiz">Quiz</option>
                <option value="Test">Test</option>
                <option value="MidtermExam">Midterm Exam</option>
                <option value="FinalExam">Final Exam</option>
                <option value="Homework">Homework</option>
                <option value="Project">Project</option>
                <option value="Participation">Participation</option>
              </select>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Score</label>
              <input type="number" [(ngModel)]="gradeForm.score" placeholder="e.g. 85" />
            </div>
            <div class="form-group">
              <label>Max Score</label>
              <input type="number" [(ngModel)]="gradeForm.maxScore" placeholder="e.g. 100" />
            </div>
            <div class="form-group">
              <label>Letter Grade (optional)</label>
              <select [(ngModel)]="gradeForm.letterGrade">
                <option value="">-- Select --</option>
                <option *ngFor="let g of letterGrades" [value]="g">{{g}}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Notes (optional)</label>
            <textarea [(ngModel)]="gradeForm.notes" rows="2" placeholder="Additional notes..."></textarea>
          </div>
          <div class="form-actions">
            <button class="btn-primary" (click)="submitGradeRecord()" [disabled]="gradeSubmitting">
              {{gradeSubmitting ? 'Saving...' : 'Save Grade Record'}}
            </button>
          </div>
          <p *ngIf="gradeSuccess" class="success-msg">Grade record saved!</p>
          <p *ngIf="gradeError" class="error-msg">{{gradeError}}</p>
        </div>
      </div>

      <!-- EXISTING RECORDS TABLE -->
      <div class="card">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Subject</th><th>Score</th><th>Grade</th><th>Assessment</th><th>Date</th></tr></thead>
          <tbody>
            <tr *ngFor="let r of gradeRecords">
              <td>{{r.studentName}}</td><td>{{r.subjectName}}</td><td>{{r.score}}/{{r.maxScore}}</td>
              <td>{{r.letterGrade}}</td><td>{{r.assessmentType}}</td><td>{{r.recordedDate | localDate:'mediumDate'}}</td>
            </tr>
            <tr *ngIf="!gradeRecords.length"><td colspan="6" class="empty-row">No grade records found.</td></tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <!-- ====== BEHAVIOR FEEDBACK TAB ====== -->
    <ng-container *ngIf="tab==='behavior'">
      <!-- ADD BEHAVIOR FEEDBACK FORM (Teacher only) -->
      <div class="card form-card" *ngIf="isTeacher">
        <div class="form-header" (click)="showBehaviorForm=!showBehaviorForm">
          <h3>+ Add Behavior Feedback</h3>
          <span class="toggle">{{showBehaviorForm ? '▲' : '▼'}}</span>
        </div>
        <div *ngIf="showBehaviorForm" class="form-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Assignment (Subject / Class)</label>
              <select [(ngModel)]="behaviorForm.assignmentId" (ngModelChange)="onBehaviorAssignmentChange()">
                <option value="">-- Select --</option>
                <option *ngFor="let a of teacherAssignments" [value]="a.id">
                  {{a.subjectName}} — {{a.gradeName}} / {{a.classSectionName}} ({{a.semesterName}})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Student</label>
              <select [(ngModel)]="behaviorForm.studentProfileId">
                <option value="">-- Select --</option>
                <option *ngFor="let s of behaviorStudents" [value]="s.studentProfileId">{{s.studentName}}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="behaviorForm.category">
                <option value="">-- Select --</option>
                <option value="Participation">Participation</option>
                <option value="Discipline">Discipline</option>
                <option value="Teamwork">Teamwork</option>
                <option value="Leadership">Leadership</option>
                <option value="Respect">Respect</option>
                <option value="Punctuality">Punctuality</option>
                <option value="Homework">Homework</option>
              </select>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Rating (1-5)</label>
              <div class="rating-buttons">
                <button *ngFor="let n of [1,2,3,4,5]" [class.selected]="behaviorForm.rating===n"
                  (click)="behaviorForm.rating=n" class="rating-btn">{{n}}</button>
              </div>
            </div>
            <div class="form-group" style="grid-column: span 2">
              <label>Description (optional)</label>
              <textarea [(ngModel)]="behaviorForm.description" rows="2" placeholder="Describe the behavior..."></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-primary" (click)="submitBehaviorFeedback()" [disabled]="behaviorSubmitting">
              {{behaviorSubmitting ? 'Saving...' : 'Save Feedback'}}
            </button>
          </div>
          <p *ngIf="behaviorSuccess" class="success-msg">Behavior feedback saved!</p>
          <p *ngIf="behaviorError" class="error-msg">{{behaviorError}}</p>
        </div>
      </div>

      <!-- EXISTING BEHAVIOR TABLE -->
      <div class="card">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Category</th><th>Rating</th><th>Description</th><th>Date</th></tr></thead>
          <tbody>
            <tr *ngFor="let b of behaviorFeedback">
              <td>{{b.studentName}}</td><td>{{b.category}}</td><td>{{b.rating}}/5</td><td>{{b.description}}</td><td>{{b.recordedDate | localDate:'mediumDate'}}</td>
            </tr>
            <tr *ngIf="!behaviorFeedback.length"><td colspan="5" class="empty-row">No behavior feedback found.</td></tr>
          </tbody>
        </table>
      </div>
    </ng-container>
  `,
  styles: [`
    .page-header{margin-bottom:1.5rem}.page-header h1{margin:0}
    .tabs{display:flex;gap:.5rem;margin-bottom:1rem}
    .tabs button{padding:.5rem 1rem;border:1px solid #e2e8f0;border-radius:6px;background:white;cursor:pointer}
    .tabs button.active{background:#0f172a;color:white;border-color:#0f172a}
    .card{background:#fff;padding:1.5rem;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:1rem}
    .form-card{border:1px solid #e2e8f0}
    .form-header{display:flex;justify-content:space-between;align-items:center;cursor:pointer}
    .form-header h3{margin:0;color:#0f172a;font-size:1rem}.toggle{color:#64748b}
    .form-body{margin-top:1rem;padding-top:1rem;border-top:1px solid #f1f5f9}
    .form-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:.75rem}
    .form-group{margin-bottom:.5rem}.form-group label{display:block;margin-bottom:.25rem;font-weight:600;font-size:.875rem;color:#334155}
    .form-group input,.form-group select,.form-group textarea{width:100%;padding:.5rem;border:1px solid #e2e8f0;border-radius:4px;box-sizing:border-box;font-size:.875rem}
    .form-group textarea{resize:vertical}
    .form-actions{display:flex;justify-content:flex-end;margin-top:.75rem}
    .btn-primary{padding:.5rem 1.25rem;background:#0f172a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.875rem}
    .btn-primary:disabled{opacity:.6;cursor:not-allowed}
    .rating-buttons{display:flex;gap:.25rem}
    .rating-btn{width:36px;height:36px;border:2px solid #e2e8f0;border-radius:6px;background:white;cursor:pointer;font-weight:700;font-size:.875rem}
    .rating-btn.selected{background:#0f172a;color:white;border-color:#0f172a}
    .data-table{width:100%;border-collapse:collapse}.data-table th,.data-table td{padding:.75rem;text-align:left;border-bottom:1px solid #e2e8f0}
    .data-table th{font-weight:600;color:#64748b;font-size:.8rem;text-transform:uppercase}
    .empty-row{text-align:center;color:#94a3b8;font-style:italic}
    .success-msg{color:#166534;font-weight:600;margin:.5rem 0 0}.error-msg{color:#991b1b;font-weight:600;margin:.5rem 0 0}
  `]
})
export class GradesRecordsComponent implements OnInit {
  tab = 'grades';
  isTeacher = false;
  teacherAssignments: TeacherAssignmentDto[] = [];
  letterGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

  // Grade Records
  gradeRecords: GradeRecordDto[] = [];
  showGradeForm = false;
  gradeStudents: StudentAssignmentDto[] = [];
  gradeForm = { assignmentId: '', studentProfileId: '', score: null as number | null, maxScore: null as number | null, letterGrade: '', assessmentType: '', notes: '' };
  gradeSubmitting = false;
  gradeSuccess = false;
  gradeError = '';

  // Behavior Feedback
  behaviorFeedback: BehaviorFeedbackDto[] = [];
  showBehaviorForm = false;
  behaviorStudents: StudentAssignmentDto[] = [];
  behaviorForm = { assignmentId: '', studentProfileId: '', category: '', description: '', rating: 0 };
  behaviorSubmitting = false;
  behaviorSuccess = false;
  behaviorError = '';

  constructor(
    private gradesSvc: GradesService,
    private assignmentSvc: AssignmentService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.isTeacher = this.auth.userRole === 'Teacher';

    this.gradesSvc.getRecords().subscribe(r => this.gradeRecords = r);
    this.gradesSvc.getBehavior().subscribe(b => this.behaviorFeedback = b);

    if (this.isTeacher) {
      const profileId = this.auth.profileId;
      if (profileId) {
        this.assignmentSvc.getTeacherAssignments({ teacherId: profileId }).subscribe(
          a => this.teacherAssignments = a.filter(x => x.isActive)
        );
      }
    }
  }

  onGradeAssignmentChange() {
    this.gradeStudents = [];
    this.gradeForm.studentProfileId = '';
    if (!this.gradeForm.assignmentId) return;
    const assignment = this.teacherAssignments.find(a => a.id === this.gradeForm.assignmentId);
    if (!assignment) return;
    this.assignmentSvc.getStudentAssignments({ classId: assignment.classSectionId, semesterId: assignment.semesterId })
      .subscribe(s => this.gradeStudents = s.filter(x => x.isActive));
  }

  onBehaviorAssignmentChange() {
    this.behaviorStudents = [];
    this.behaviorForm.studentProfileId = '';
    if (!this.behaviorForm.assignmentId) return;
    const assignment = this.teacherAssignments.find(a => a.id === this.behaviorForm.assignmentId);
    if (!assignment) return;
    this.assignmentSvc.getStudentAssignments({ classId: assignment.classSectionId, semesterId: assignment.semesterId })
      .subscribe(s => this.behaviorStudents = s.filter(x => x.isActive));
  }

  submitGradeRecord() {
    const assignment = this.teacherAssignments.find(a => a.id === this.gradeForm.assignmentId);
    if (!assignment || !this.gradeForm.studentProfileId) return;

    this.gradeSubmitting = true;
    this.gradeSuccess = false;
    this.gradeError = '';

    const req: CreateGradeRecordRequest = {
      studentProfileId: this.gradeForm.studentProfileId,
      subjectId: assignment.subjectId,
      semesterId: assignment.semesterId,
      score: this.gradeForm.score ?? undefined,
      maxScore: this.gradeForm.maxScore ?? undefined,
      letterGrade: this.gradeForm.letterGrade || undefined,
      assessmentType: this.gradeForm.assessmentType || undefined,
      notes: this.gradeForm.notes || undefined
    };

    this.gradesSvc.createRecord(this.auth.profileId!, req).subscribe({
      next: (record) => {
        this.gradeSubmitting = false;
        this.gradeSuccess = true;
        this.gradeRecords = [record, ...this.gradeRecords];
        this.gradeForm = { assignmentId: this.gradeForm.assignmentId, studentProfileId: '', score: null, maxScore: this.gradeForm.maxScore, letterGrade: '', assessmentType: this.gradeForm.assessmentType, notes: '' };
      },
      error: (err) => {
        this.gradeSubmitting = false;
        this.gradeError = err?.error?.message || err?.error?.detail || 'Failed to save grade record.';
      }
    });
  }

  submitBehaviorFeedback() {
    const assignment = this.teacherAssignments.find(a => a.id === this.behaviorForm.assignmentId);
    if (!assignment || !this.behaviorForm.studentProfileId || !this.behaviorForm.category) return;

    this.behaviorSubmitting = true;
    this.behaviorSuccess = false;
    this.behaviorError = '';

    const req: CreateBehaviorFeedbackRequest = {
      studentProfileId: this.behaviorForm.studentProfileId,
      semesterId: assignment.semesterId,
      category: this.behaviorForm.category,
      description: this.behaviorForm.description || undefined,
      rating: this.behaviorForm.rating > 0 ? this.behaviorForm.rating : undefined
    };

    this.gradesSvc.createBehavior(this.auth.profileId!, req).subscribe({
      next: (feedback) => {
        this.behaviorSubmitting = false;
        this.behaviorSuccess = true;
        this.behaviorFeedback = [feedback, ...this.behaviorFeedback];
        this.behaviorForm = { assignmentId: this.behaviorForm.assignmentId, studentProfileId: '', category: '', description: '', rating: 0 };
      },
      error: (err) => {
        this.behaviorSubmitting = false;
        this.behaviorError = err?.error?.message || err?.error?.detail || 'Failed to save behavior feedback.';
      }
    });
  }
}
