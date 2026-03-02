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
      <button class="tab-btn" [class.active]="tab==='grades'" (click)="tab='grades'">Grade Records</button>
      <button class="tab-btn" [class.active]="tab==='behavior'" (click)="tab='behavior'">Behavior Feedback</button>
    </div>

    <!-- ====== GRADE RECORDS TAB ====== -->
    <ng-container *ngIf="tab==='grades'">
      <!-- ADD GRADE FORM (Teacher only) -->
      <div class="card" *ngIf="isTeacher">
        <div class="card-header card-header-success" (click)="showGradeForm=!showGradeForm" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center">
          <h4 class="card-title">+ Add Grade Record</h4>
          <span>{{showGradeForm ? '▲' : '▼'}}</span>
        </div>
        <div class="card-body" *ngIf="showGradeForm">
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
          <div class="card-footer" style="display:flex;justify-content:flex-end">
            <button class="btn btn-primary" (click)="submitGradeRecord()" [disabled]="gradeSubmitting">
              {{gradeSubmitting ? 'Saving...' : 'Save Grade Record'}}
            </button>
          </div>
          <div class="alert alert-success" *ngIf="gradeSuccess">Grade record saved!</div>
          <div class="alert alert-danger" *ngIf="gradeError">{{gradeError}}</div>
        </div>
      </div>

      <!-- EXISTING RECORDS TABLE -->
      <div class="card">
        <div class="card-header card-header-primary">
          <h4 class="card-title">Grade Records</h4>
          <p class="card-category">All recorded grades</p>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
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
        </div>
      </div>
    </ng-container>

    <!-- ====== BEHAVIOR FEEDBACK TAB ====== -->
    <ng-container *ngIf="tab==='behavior'">
      <!-- ADD BEHAVIOR FEEDBACK FORM (Teacher only) -->
      <div class="card" *ngIf="isTeacher">
        <div class="card-header card-header-warning" (click)="showBehaviorForm=!showBehaviorForm" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center">
          <h4 class="card-title">+ Add Behavior Feedback</h4>
          <span>{{showBehaviorForm ? '▲' : '▼'}}</span>
        </div>
        <div class="card-body" *ngIf="showBehaviorForm">
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
          <div class="card-footer" style="display:flex;justify-content:flex-end">
            <button class="btn btn-primary" (click)="submitBehaviorFeedback()" [disabled]="behaviorSubmitting">
              {{behaviorSubmitting ? 'Saving...' : 'Save Feedback'}}
            </button>
          </div>
          <div class="alert alert-success" *ngIf="behaviorSuccess">Behavior feedback saved!</div>
          <div class="alert alert-danger" *ngIf="behaviorError">{{behaviorError}}</div>
        </div>
      </div>

      <!-- EXISTING BEHAVIOR TABLE -->
      <div class="card">
        <div class="card-header card-header-primary">
          <h4 class="card-title">Behavior Feedback</h4>
          <p class="card-category">All recorded behavior feedback</p>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Student</th><th>Category</th><th>Rating</th><th>Description</th><th>Date</th></tr></thead>
              <tbody>
                <tr *ngFor="let b of behaviorFeedback">
                  <td>{{b.studentName}}</td><td>{{b.category}}</td><td>{{b.rating}}/5</td><td>{{b.description}}</td><td>{{b.recordedDate | localDate:'mediumDate'}}</td>
                </tr>
                <tr *ngIf="!behaviorFeedback.length"><td colspan="5" class="empty-row">No behavior feedback found.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [':host { display: block; }']
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
