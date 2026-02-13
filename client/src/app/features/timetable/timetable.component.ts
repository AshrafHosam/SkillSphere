import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimetableService, AcademicService } from '@core/services/data.service';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Timetable</h1>
      <button class="btn-primary" (click)="showVersionForm=!showVersionForm">+ New Version</button>
    </div>

    <div class="card" *ngIf="showVersionForm">
      <div class="form-row">
        <div class="form-group"><label>Semester</label>
          <select [(ngModel)]="versionForm.semesterId"><option *ngFor="let s of semesters" [value]="s.id">{{s.name}}</option></select>
        </div>
        <div class="form-group"><label>Name</label><input [(ngModel)]="versionForm.name" /></div>
      </div>
      <button class="btn-primary" (click)="createVersion()">Create</button>
    </div>

    <div class="card">
      <h3>Versions</h3>
      <table class="data-table"><thead><tr><th>Name</th><th>Semester</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody><tr *ngFor="let v of versions"><td>{{v.name}}</td><td>{{v.semesterName}}</td><td>
          <span [class]="'badge-' + v.status.toLowerCase()">{{v.status}}</span></td>
          <td>
            <button class="btn-sm" (click)="loadEntries(v.id)">View</button>
            <button class="btn-sm btn-success" *ngIf="v.status==='Draft'" (click)="publish(v.id)">Publish</button>
          </td></tr></tbody></table>
    </div>

    <div class="card" *ngIf="selectedVersionId">
      <h3>Entries</h3>
      <table class="data-table"><thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Class</th><th>Grade</th><th>Room</th></tr></thead>
        <tbody><tr *ngFor="let e of entries"><td>{{dayName(e.dayOfWeek)}}</td><td>{{e.startTime}}-{{e.endTime}}</td>
          <td>{{e.subjectName}}</td><td>{{e.teacherName}}</td><td>{{e.classSectionName}}</td><td>{{e.gradeName}}</td><td>{{e.room}}</td></tr></tbody></table>
    </div>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem}.page-header h1{margin:0}
    .btn-primary{padding:.5rem 1rem;background:#0f172a;color:#fff;border:none;border-radius:6px;cursor:pointer}
    .btn-sm{padding:.25rem .75rem;border:1px solid #e2e8f0;border-radius:4px;cursor:pointer;font-size:.8rem;background:white;margin-right:.25rem}
    .btn-success{background:#22c55e;color:white;border:none}
    .card{background:#fff;padding:1.5rem;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:1rem}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
    .form-group{margin-bottom:1rem}.form-group label{display:block;margin-bottom:.25rem;font-weight:600;font-size:.875rem;color:#334155}
    .form-group input,.form-group select{width:100%;padding:.5rem;border:1px solid #e2e8f0;border-radius:4px;box-sizing:border-box}
    .data-table{width:100%;border-collapse:collapse}.data-table th,.data-table td{padding:.75rem;text-align:left;border-bottom:1px solid #e2e8f0}
    .data-table th{font-weight:600;color:#64748b;font-size:.8rem;text-transform:uppercase}
    .badge-draft{background:#fef3c7;color:#92400e;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
    .badge-published{background:#dcfce7;color:#166534;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
    .badge-archived{background:#f1f5f9;color:#475569;padding:.2rem .5rem;border-radius:12px;font-size:.75rem}
  `]
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
