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
      <button class="btn btn-primary" (click)="showVersionForm=!showVersionForm">+ New Version</button>
    </div>

    <div class="card" *ngIf="showVersionForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">New Timetable Version</h4>
        <p class="card-category">Create a new timetable version</p>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Semester</label>
            <select [(ngModel)]="versionForm.semesterId"><option *ngFor="let s of semesters" [value]="s.id">{{s.name}}</option></select>
          </div>
          <div class="form-group"><label>Name</label><input [(ngModel)]="versionForm.name" /></div>
        </div>
        <button class="btn btn-primary" (click)="createVersion()">Create</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header card-header-info">
        <h4 class="card-title">Versions</h4>
        <p class="card-category">Manage timetable versions</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Name</th><th>Semester</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let v of versions"><td>{{v.name}}</td><td>{{v.semesterName}}</td><td>
              <span [class]="'badge-' + v.status.toLowerCase()">{{v.status}}</span></td>
              <td>
                <button class="btn btn-sm" (click)="loadEntries(v.id)">View</button>
                <button class="btn btn-sm btn-success" *ngIf="v.status==='Draft'" (click)="publish(v.id)">Publish</button>
              </td></tr></tbody></table>
        </div>
      </div>
    </div>

    <div class="card" *ngIf="selectedVersionId">
      <div class="card-header card-header-info">
        <h4 class="card-title">Entries</h4>
        <p class="card-category">Timetable entries for selected version</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Class</th><th>Grade</th><th>Room</th></tr></thead>
            <tbody><tr *ngFor="let e of entries"><td>{{dayName(e.dayOfWeek)}}</td><td>{{e.startTime}}-{{e.endTime}}</td>
              <td>{{e.subjectName}}</td><td>{{e.teacherName}}</td><td>{{e.classSectionName}}</td><td>{{e.gradeName}}</td><td>{{e.room}}</td></tr></tbody></table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
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
