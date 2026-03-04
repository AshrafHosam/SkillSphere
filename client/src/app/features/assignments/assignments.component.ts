import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '@core/services/data.service';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Student Assignments</h1></div>

    <div class="card">
      <div class="card-header card-header-warning">
        <h4 class="card-title">Student Assignments</h4>
        <p class="card-category">Student to group assignment records</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Student</th><th>Grade</th><th>Group</th><th>Semester</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let a of studentAssignments"><td>{{a.studentName}}</td><td>{{a.gradeName}}</td><td>{{a.groupName}}</td><td>{{a.semesterName}}</td>
              <td><button class="btn btn-sm btn-danger" (click)="removeStudentAssignment(a.id)">Remove</button></td></tr></tbody></table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class AssignmentsComponent implements OnInit {
  studentAssignments: any[] = [];

  constructor(private assignmentSvc: AssignmentService) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.assignmentSvc.getStudentAssignments().subscribe(d => this.studentAssignments = d);
  }

  removeStudentAssignment(id: string) { this.assignmentSvc.deleteStudentAssignment(id).subscribe(() => this.loadAll()); }
}
