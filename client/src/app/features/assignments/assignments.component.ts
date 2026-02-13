import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService, AcademicService, UserService } from '@core/services/data.service';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Assignments</h1></div>

    <div class="tabs">
      <button [class.active]="tab==='student'" (click)="tab='student'">Student Assignments</button>
      <button [class.active]="tab==='teacher'" (click)="tab='teacher'">Teacher Assignments</button>
    </div>

    <div class="card" *ngIf="tab==='student'">
      <h3>Student → Class Assignments</h3>
      <table class="data-table"><thead><tr><th>Student</th><th>Grade</th><th>Class</th><th>Semester</th><th>Actions</th></tr></thead>
        <tbody><tr *ngFor="let a of studentAssignments"><td>{{a.studentName}}</td><td>{{a.gradeName}}</td><td>{{a.classSectionName}}</td><td>{{a.semesterName}}</td>
          <td><button class="btn-sm btn-danger" (click)="removeStudentAssignment(a.id)">Remove</button></td></tr></tbody></table>
    </div>

    <div class="card" *ngIf="tab==='teacher'">
      <h3>Teacher → Subject/Class Assignments</h3>
      <table class="data-table"><thead><tr><th>Teacher</th><th>Subject</th><th>Class</th><th>Grade</th><th>Semester</th><th>Actions</th></tr></thead>
        <tbody><tr *ngFor="let a of teacherAssignments"><td>{{a.teacherName}}</td><td>{{a.subjectName}}</td><td>{{a.classSectionName}}</td><td>{{a.gradeName}}</td><td>{{a.semesterName}}</td>
          <td><button class="btn-sm btn-danger" (click)="removeTeacherAssignment(a.id)">Remove</button></td></tr></tbody></table>
    </div>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem}.page-header h1{margin:0}
    .tabs{display:flex;gap:.5rem;margin-bottom:1rem}
    .tabs button{padding:.5rem 1rem;border:1px solid #e2e8f0;border-radius:6px;background:white;cursor:pointer}
    .tabs button.active{background:#0f172a;color:white;border-color:#0f172a}
    .card{background:#fff;padding:1.5rem;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:1rem}
    .btn-sm{padding:.25rem .75rem;border:none;border-radius:4px;cursor:pointer;font-size:.8rem}
    .btn-danger{background:#ef4444;color:#fff}
    .data-table{width:100%;border-collapse:collapse}
    .data-table th,.data-table td{padding:.75rem;text-align:left;border-bottom:1px solid #e2e8f0}
    .data-table th{font-weight:600;color:#64748b;font-size:.8rem;text-transform:uppercase}
  `]
})
export class AssignmentsComponent implements OnInit {
  tab = 'student';
  studentAssignments: any[] = [];
  teacherAssignments: any[] = [];

  constructor(private assignmentSvc: AssignmentService) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.assignmentSvc.getStudentAssignments().subscribe(d => this.studentAssignments = d);
    this.assignmentSvc.getTeacherAssignments().subscribe(d => this.teacherAssignments = d);
  }

  removeStudentAssignment(id: string) { this.assignmentSvc.deleteStudentAssignment(id).subscribe(() => this.loadAll()); }
  removeTeacherAssignment(id: string) { this.assignmentSvc.deleteTeacherAssignment(id).subscribe(() => this.loadAll()); }
}
