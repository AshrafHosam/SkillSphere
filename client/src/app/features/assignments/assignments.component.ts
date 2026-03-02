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
      <div class="card-header card-header-warning">
        <h4 class="card-title">Student Assignments</h4>
        <p class="card-category">Student to class assignment records</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Student</th><th>Grade</th><th>Class</th><th>Semester</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let a of studentAssignments"><td>{{a.studentName}}</td><td>{{a.gradeName}}</td><td>{{a.classSectionName}}</td><td>{{a.semesterName}}</td>
              <td><button class="btn btn-sm btn-danger" (click)="removeStudentAssignment(a.id)">Remove</button></td></tr></tbody></table>
        </div>
      </div>
    </div>

    <div class="card" *ngIf="tab==='teacher'">
      <div class="card-header card-header-warning">
        <h4 class="card-title">Teacher Assignments</h4>
        <p class="card-category">Teacher to subject and class assignment records</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Teacher</th><th>Subject</th><th>Class</th><th>Grade</th><th>Semester</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let a of teacherAssignments"><td>{{a.teacherName}}</td><td>{{a.subjectName}}</td><td>{{a.classSectionName}}</td><td>{{a.gradeName}}</td><td>{{a.semesterName}}</td>
              <td><button class="btn btn-sm btn-danger" (click)="removeTeacherAssignment(a.id)">Remove</button></td></tr></tbody></table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
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
