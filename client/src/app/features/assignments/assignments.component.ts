import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService, AcademicService, UserService } from '@core/services/data.service';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6 flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-white/90">Assignments</h1>
    </div>

    <div class="mb-4 flex gap-2">
      <button (click)="tab='student'"
        [ngClass]="tab==='student' ? 'tab-active' : 'tab-inactive'">Student Assignments</button>
      <button (click)="tab='teacher'"
        [ngClass]="tab==='teacher' ? 'tab-active' : 'tab-inactive'">Teacher Assignments</button>
    </div>

    <div *ngIf="tab==='student'" class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4">
      <h3 class="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Student → Class Assignments</h3>
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="overflow-x-auto"><table class="w-full table-auto">
          <thead><tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Grade</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Class</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Semester</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr *ngFor="let a of studentAssignments" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{a.studentName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{a.gradeName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{a.classSectionName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{a.semesterName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                <button class="rounded-lg bg-error-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-600" (click)="removeStudentAssignment(a.id)">Remove</button>
              </td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </div>

    <div *ngIf="tab==='teacher'" class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4">
      <h3 class="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Teacher → Subject/Class Assignments</h3>
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="overflow-x-auto"><table class="w-full table-auto">
          <thead><tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Teacher</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Subject</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Class</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Grade</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Semester</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr *ngFor="let a of teacherAssignments" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{a.teacherName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{a.subjectName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{a.classSectionName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{a.gradeName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{a.semesterName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                <button class="rounded-lg bg-error-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-600" (click)="removeTeacherAssignment(a.id)">Remove</button>
              </td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </div>
  `,
  styles: []
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
