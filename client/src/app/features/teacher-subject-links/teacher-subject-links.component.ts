import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherSubjectLinkService, AcademicService, UserService } from '@core/services/data.service';
import { TeacherSubjectLinkDto } from '@core/models';

@Component({
  selector: 'app-teacher-subject-links',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Teacher-Subject Links</h1>
      <button class="btn btn-primary" (click)="showForm=!showForm">{{ showForm ? 'Cancel' : '+ Add Link' }}</button>
    </div>

    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">Add Teacher-Subject Link</h4>
        <p class="card-category">Link a teacher to a subject they can teach for a grade</p>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Teacher</label>
            <select [(ngModel)]="form.teacherProfileId"><option value="">Select</option><option *ngFor="let t of teachers" [value]="t.id">{{t.fullName}}</option></select>
          </div>
          <div class="form-group"><label>Subject</label>
            <select [(ngModel)]="form.subjectId"><option value="">Select</option><option *ngFor="let s of subjects" [value]="s.id">{{s.name}}</option></select>
          </div>
          <div class="form-group"><label>Grade (optional)</label>
            <select [(ngModel)]="form.gradeId"><option value="">Any Grade</option><option *ngFor="let g of grades" [value]="g.id">{{g.name}}</option></select>
          </div>
        </div>
        <button class="btn btn-primary" (click)="save()">Save</button>
        <button class="btn btn-default" (click)="showForm=false">Cancel</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header card-header-info">
        <h4 class="card-title">All Links</h4>
        <p class="card-category">{{items.length}} link(s)</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Teacher</th><th>Subject</th><th>Grade</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let l of items">
                <td>{{l.teacherName}}</td><td>{{l.subjectName}}</td><td>{{l.gradeName}}</td>
                <td><button class="btn btn-sm btn-danger" (click)="remove(l.id)">Remove</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class TeacherSubjectLinksComponent implements OnInit {
  items: TeacherSubjectLinkDto[] = [];
  teachers: any[] = [];
  subjects: any[] = [];
  grades: any[] = [];
  showForm = false;
  form: any = {};

  constructor(
    private svc: TeacherSubjectLinkService,
    private academicSvc: AcademicService,
    private userSvc: UserService
  ) {}

  ngOnInit() {
    this.load();
    this.academicSvc.getSubjects().subscribe(s => this.subjects = s);
    this.academicSvc.getGrades().subscribe(g => this.grades = g);
    this.userSvc.getTeachers().subscribe((u: any) => this.teachers = u.items || u);
  }

  load() { this.svc.getLinks().subscribe(d => this.items = d); }

  save() {
    const payload = { ...this.form };
    if (!payload.gradeId) { delete payload.gradeId; }
    this.svc.create(payload).subscribe(() => { this.showForm = false; this.form = {}; this.load(); });
  }

  remove(id: string) { this.svc.remove(id).subscribe(() => this.load()); }
}
