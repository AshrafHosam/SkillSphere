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
    <div class="mb-6 flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-white/90">Grade Records</h1>
    </div>

    <div class="mb-4 flex gap-2">
      <button (click)="tab='grades'"
        [ngClass]="tab==='grades' ? 'tab-active' : 'tab-inactive'">Grade Records</button>
      <button (click)="tab='behavior'"
        [ngClass]="tab==='behavior' ? 'tab-active' : 'tab-inactive'">Behavior Feedback</button>
    </div>

    <!-- ====== GRADE RECORDS TAB ====== -->
    <ng-container *ngIf="tab==='grades'">
      <!-- ADD GRADE FORM (Teacher only) -->
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="isTeacher">
        <div class="flex cursor-pointer items-center justify-between" (click)="showGradeForm=!showGradeForm">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white/90">+ Add Grade Record</h3>
          <span class="text-gray-400">{{showGradeForm ? '▲' : '▼'}}</span>
        </div>
        <div *ngIf="showGradeForm" class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Assignment (Subject / Class)</label>
              <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="gradeForm.assignmentId" (ngModelChange)="onGradeAssignmentChange()">
                <option value="">-- Select --</option>
                <option *ngFor="let a of teacherAssignments" [value]="a.id">
                  {{a.subjectName}} — {{a.gradeName}} / {{a.classSectionName}} ({{a.semesterName}})
                </option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Student</label>
              <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="gradeForm.studentProfileId">
                <option value="">-- Select --</option>
                <option *ngFor="let s of gradeStudents" [value]="s.studentProfileId">{{s.studentName}}</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Assessment Type</label>
              <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="gradeForm.assessmentType">
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
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Score</label>
              <input type="number" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="gradeForm.score" placeholder="e.g. 85" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Max Score</label>
              <input type="number" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="gradeForm.maxScore" placeholder="e.g. 100" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Letter Grade (optional)</label>
              <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="gradeForm.letterGrade">
                <option value="">-- Select --</option>
                <option *ngFor="let g of letterGrades" [value]="g">{{g}}</option>
              </select>
            </div>
          </div>
          <div class="mb-3">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Notes (optional)</label>
            <textarea class="w-full resize-y rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="gradeForm.notes" rows="2" placeholder="Additional notes..."></textarea>
          </div>
          <div class="mt-4 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
            <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60" (click)="submitGradeRecord()" [disabled]="gradeSubmitting">
              {{gradeSubmitting ? 'Saving...' : 'Save Grade Record'}}
            </button>
          </div>
          <p *ngIf="gradeSuccess" class="mt-3 text-sm font-semibold text-success-600 dark:text-success-400">Grade record saved!</p>
          <p *ngIf="gradeError" class="mt-3 text-sm font-semibold text-error-600 dark:text-error-400">{{gradeError}}</p>
        </div>
      </div>

      <!-- EXISTING RECORDS TABLE -->
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="overflow-x-auto"><table class="w-full table-auto">
          <thead><tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Subject</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Score</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Grade</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Assessment</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr *ngFor="let r of gradeRecords" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.studentName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.subjectName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.score}}/{{r.maxScore}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.letterGrade}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.assessmentType}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{r.recordedDate | localDate:'mediumDate'}}</td>
            </tr>
            <tr *ngIf="!gradeRecords.length"><td colspan="6" class="px-5 py-8 text-center text-sm text-gray-400">No grade records found.</td></tr>
          </tbody>
        </table></div>
      </div>
    </ng-container>

    <!-- ====== BEHAVIOR FEEDBACK TAB ====== -->
    <ng-container *ngIf="tab==='behavior'">
      <!-- ADD BEHAVIOR FEEDBACK FORM (Teacher only) -->
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="isTeacher">
        <div class="flex cursor-pointer items-center justify-between" (click)="showBehaviorForm=!showBehaviorForm">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white/90">+ Add Behavior Feedback</h3>
          <span class="text-gray-400">{{showBehaviorForm ? '▲' : '▼'}}</span>
        </div>
        <div *ngIf="showBehaviorForm" class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Assignment (Subject / Class)</label>
              <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="behaviorForm.assignmentId" (ngModelChange)="onBehaviorAssignmentChange()">
                <option value="">-- Select --</option>
                <option *ngFor="let a of teacherAssignments" [value]="a.id">
                  {{a.subjectName}} — {{a.gradeName}} / {{a.classSectionName}} ({{a.semesterName}})
                </option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Student</label>
              <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="behaviorForm.studentProfileId">
                <option value="">-- Select --</option>
                <option *ngFor="let s of behaviorStudents" [value]="s.studentProfileId">{{s.studentName}}</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Category</label>
              <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="behaviorForm.category">
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
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-3">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Rating (1-5)</label>
              <div class="flex gap-1">
                <button *ngFor="let n of [1,2,3,4,5]" (click)="behaviorForm.rating=n"
                  class="rating-btn"
                  [ngClass]="behaviorForm.rating===n ? 'rating-btn-active' : 'rating-btn-inactive'">{{n}}</button>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Description (optional)</label>
              <textarea class="w-full resize-y rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="behaviorForm.description" rows="2" placeholder="Describe the behavior..."></textarea>
            </div>
          </div>
          <div class="mt-4 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
            <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60" (click)="submitBehaviorFeedback()" [disabled]="behaviorSubmitting">
              {{behaviorSubmitting ? 'Saving...' : 'Save Feedback'}}
            </button>
          </div>
          <p *ngIf="behaviorSuccess" class="mt-3 text-sm font-semibold text-success-600 dark:text-success-400">Behavior feedback saved!</p>
          <p *ngIf="behaviorError" class="mt-3 text-sm font-semibold text-error-600 dark:text-error-400">{{behaviorError}}</p>
        </div>
      </div>

      <!-- EXISTING BEHAVIOR TABLE -->
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="overflow-x-auto"><table class="w-full table-auto">
          <thead><tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Rating</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr *ngFor="let b of behaviorFeedback" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{b.studentName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{b.category}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{b.rating}}/5</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{b.description}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{b.recordedDate | localDate:'mediumDate'}}</td>
            </tr>
            <tr *ngIf="!behaviorFeedback.length"><td colspan="5" class="px-5 py-8 text-center text-sm text-gray-400">No behavior feedback found.</td></tr>
          </tbody>
        </table></div>
      </div>
    </ng-container>
  `,
  styles: []
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
