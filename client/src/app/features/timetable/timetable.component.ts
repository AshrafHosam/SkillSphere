import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimetableService, AcademicService } from '@core/services/data.service';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6 flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-white/90">Timetable</h1>
      <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600" (click)="showVersionForm=!showVersionForm">+ New Version</button>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="showVersionForm">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-3">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Semester</label>
          <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="versionForm.semesterId">
            <option *ngFor="let s of semesters" [value]="s.id">{{s.name}}</option>
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Name</label>
          <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" [(ngModel)]="versionForm.name" />
        </div>
      </div>
      <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600" (click)="createVersion()">Create</button>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4">
      <h3 class="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Versions</h3>
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="overflow-x-auto"><table class="w-full table-auto">
          <thead><tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Semester</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr *ngFor="let v of versions" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{v.name}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{v.semesterName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                <span class="badge"
                  [ngClass]="{
                    'badge-warning': v.status === 'Draft',
                    'badge-success': v.status === 'Published',
                    'badge-gray': v.status === 'Archived'
                  }">{{v.status}}</span>
              </td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                <div class="flex gap-2">
                  <button class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800" (click)="loadEntries(v.id)">View</button>
                  <button class="rounded-lg bg-success-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-success-600" *ngIf="v.status==='Draft'" (click)="publish(v.id)">Publish</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-4" *ngIf="selectedVersionId">
      <h3 class="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Entries</h3>
      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="overflow-x-auto"><table class="w-full table-auto">
          <thead><tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Day</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Time</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Subject</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Teacher</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Class</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Grade</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Room</th>
          </tr></thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr *ngFor="let e of entries" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{dayName(e.dayOfWeek)}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{e.startTime}}-{{e.endTime}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{e.subjectName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{e.teacherName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{e.classSectionName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{e.gradeName}}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{e.room}}</td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </div>
  `,
  styles: []
})
export class TimetableComponent implements OnInit {
  versions: any[] = []; entries: any[] = []; semesters: any[] = [];
  showVersionForm = false; versionForm: any = {};
  selectedVersionId: string | null = null;

  constructor(private timetableSvc: TimetableService, private academicSvc: AcademicService) {}

  ngOnInit() {
    this.timetableSvc.getVersions().subscribe(v => this.versions = v);
    this.academicSvc.getSemesters().subscribe(s => this.semesters = s);
  }

  createVersion() {
    this.timetableSvc.createVersion(this.versionForm).subscribe(() => {
      this.showVersionForm = false; this.versionForm = {};
      this.timetableSvc.getVersions().subscribe(v => this.versions = v);
    });
  }

  publish(id: string) {
    this.timetableSvc.publishVersion(id).subscribe(() =>
      this.timetableSvc.getVersions().subscribe(v => this.versions = v));
  }

  loadEntries(versionId: string) {
    this.selectedVersionId = versionId;
    this.timetableSvc.getEntries(versionId).subscribe(e => this.entries = e);
  }

  dayName(d: number): string {
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d] || '';
  }
}
