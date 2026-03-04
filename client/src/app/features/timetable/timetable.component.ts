import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimetableService, AcademicService, RoomService, PeriodDefinitionService, UserService } from '@core/services/data.service';
import { TimetableVersionDto, TimetableEntryDto, TimetableValidationError, AddTimetableEntryRequest, SubjectDto, RoomDto, PeriodDefinitionDto, TeacherProfileDto } from '@core/models';

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
        <p class="card-category">Create a new draft timetable for a group</p>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Group</label>
            <select [(ngModel)]="versionForm.groupId"><option value="">Select</option><option *ngFor="let g of groups" [value]="g.id">{{g.gradeName}} / {{g.name}}</option></select>
          </div>
          <div class="form-group"><label>Semester</label>
            <select [(ngModel)]="versionForm.semesterId"><option value="">Select</option><option *ngFor="let s of semesters" [value]="s.id">{{s.name}}</option></select>
          </div>
          <div class="form-group"><label>Name</label><input [(ngModel)]="versionForm.name" /></div>
        </div>
        <button class="btn btn-primary" (click)="createVersion()">Create</button>
      </div>
    </div>

    <!-- Filter -->
    <div class="card">
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Filter by Group</label>
            <select [(ngModel)]="filterGroupId" (ngModelChange)="reloadVersions()"><option value="">All Groups</option><option *ngFor="let g of groups" [value]="g.id">{{g.gradeName}} / {{g.name}}</option></select>
          </div>
          <div class="form-group"><label>Filter by Semester</label>
            <select [(ngModel)]="filterSemesterId" (ngModelChange)="reloadVersions()"><option value="">All Semesters</option><option *ngFor="let s of semesters" [value]="s.id">{{s.name}}</option></select>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header card-header-info">
        <h4 class="card-title">Versions</h4>
        <p class="card-category">Manage timetable versions (Draft → Published → Archived)</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Name</th><th>Group</th><th>Semester</th><th>Status</th><th>Entries</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let v of versions"><td>{{v.name}}</td><td>{{v.groupName}}</td><td>{{v.semesterName}}</td><td>
              <span [class]="'badge-' + v.status.toLowerCase()">{{v.status}}</span></td><td>{{v.entryCount}}</td>
              <td>
                <button class="btn btn-sm" (click)="loadEntries(v.id)">View</button>
                <button class="btn btn-sm btn-info" *ngIf="v.status==='Draft'" (click)="validateVersion(v.id)">Validate</button>
                <button class="btn btn-sm btn-success" *ngIf="v.status==='Draft'" (click)="publishVersion(v.id)">Publish</button>
                <button class="btn btn-sm btn-warning" *ngIf="v.status==='Published'" (click)="archiveVersion(v.id)">Archive</button>
              </td></tr></tbody></table>
        </div>
      </div>
    </div>

    <!-- Validation Results -->
    <div class="card" *ngIf="validationErrors.length">
      <div class="card-header card-header-warning">
        <h4 class="card-title">Validation Results</h4>
        <p class="card-category">{{validationErrors.length}} issue(s) found</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Rule</th><th>Severity</th><th>Message</th></tr></thead>
            <tbody><tr *ngFor="let e of validationErrors"><td>{{e.rule}}</td>
              <td><span [class]="'badge-' + e.severity.toLowerCase()">{{e.severity}}</span></td>
              <td>{{e.message}}</td></tr></tbody></table>
        </div>
      </div>
    </div>

    <div class="card" *ngIf="selectedVersionId">
      <div class="card-header card-header-info">
        <h4 class="card-title">Entries</h4>
        <p class="card-category">Timetable entries for selected version</p>
      </div>
      <div class="card-body">
        <!-- Add Entry Form (Draft versions only) -->
        <div class="entry-form" *ngIf="selectedVersionStatus==='Draft'">
          <h5>Add Entry</h5>
          <div class="form-row">
            <div class="form-group"><label>Day</label>
              <select [(ngModel)]="entryForm.dayOfWeek">
                <option [ngValue]="0">Sunday</option><option [ngValue]="1">Monday</option><option [ngValue]="2">Tuesday</option>
                <option [ngValue]="3">Wednesday</option><option [ngValue]="4">Thursday</option>
              </select>
            </div>
            <div class="form-group"><label>Period</label>
              <select [(ngModel)]="entryForm.periodDefinitionId"><option value="">Select</option>
                <option *ngFor="let p of periods" [value]="p.id">{{p.label}} ({{p.startTime}}-{{p.endTime}})</option></select>
            </div>
            <div class="form-group"><label>Subject</label>
              <select [(ngModel)]="entryForm.subjectId"><option value="">Select</option>
                <option *ngFor="let s of subjects" [value]="s.id">{{s.name}}</option></select>
            </div>
            <div class="form-group"><label>Teacher</label>
              <select [(ngModel)]="entryForm.teacherProfileId"><option value="">Select</option>
                <option *ngFor="let t of teachers" [value]="t.profileId">{{t.fullName}}</option></select>
            </div>
            <div class="form-group"><label>Room</label>
              <select [(ngModel)]="entryForm.roomId"><option value="">Select</option>
                <option *ngFor="let r of rooms" [value]="r.id">{{r.name}} ({{r.roomType}})</option></select>
            </div>
          </div>
          <button class="btn btn-primary" (click)="addEntry()">Add Entry</button>
          <span class="error-msg" *ngIf="addEntryError">{{addEntryError}}</span>
        </div>
        <hr *ngIf="selectedVersionStatus==='Draft'" />
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Day</th><th>Period</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let e of entries"><td>{{dayName(e.dayOfWeek)}}</td><td>{{e.periodLabel}}</td><td>{{e.startTime}}-{{e.endTime}}</td>
              <td>{{e.subjectName}}</td><td>{{e.teacherName}}</td><td>{{e.roomName}}</td>
              <td><button class="btn btn-sm btn-danger" *ngIf="selectedVersionStatus==='Draft'" (click)="removeEntry(e.id)">Remove</button></td></tr></tbody></table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; } .entry-form { background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 16px; } .error-msg { color: #e53935; margin-left: 12px; }`]
})
export class TimetableComponent implements OnInit {
  versions: TimetableVersionDto[] = [];
  entries: TimetableEntryDto[] = [];
  semesters: any[] = [];
  groups: any[] = [];
  subjects: SubjectDto[] = [];
  teachers: TeacherProfileDto[] = [];
  rooms: RoomDto[] = [];
  periods: PeriodDefinitionDto[] = [];
  validationErrors: TimetableValidationError[] = [];
  showVersionForm = false;
  versionForm: any = {};
  selectedVersionId: string | null = null;
  selectedVersionStatus: string | null = null;
  filterGroupId = '';
  filterSemesterId = '';
  entryForm: any = { dayOfWeek: 0, periodDefinitionId: '', subjectId: '', teacherProfileId: '', roomId: '' };
  addEntryError = '';

  constructor(
    private timetableSvc: TimetableService,
    private academicSvc: AcademicService,
    private roomSvc: RoomService,
    private periodSvc: PeriodDefinitionService,
    private userSvc: UserService
  ) {}

  ngOnInit() {
    this.reloadVersions();
    this.academicSvc.getSemesters().subscribe(s => this.semesters = s);
    this.academicSvc.getGroups().subscribe(g => this.groups = g);
    this.academicSvc.getSubjects().subscribe(s => this.subjects = s);
    this.roomSvc.getAll().subscribe(r => this.rooms = r);
    this.periodSvc.getAll().subscribe(p => this.periods = p.filter((x: PeriodDefinitionDto) => !x.isBreak).sort((a: PeriodDefinitionDto, b: PeriodDefinitionDto) => a.periodNumber - b.periodNumber));
    this.userSvc.getTeachers().subscribe((r: any) => this.teachers = r.items);
  }

  reloadVersions() {
    this.timetableSvc.getVersions(this.filterGroupId || undefined, this.filterSemesterId || undefined)
      .subscribe(v => this.versions = v);
  }

  createVersion() {
    this.timetableSvc.createVersion(this.versionForm).subscribe(() => {
      this.showVersionForm = false; this.versionForm = {};
      this.reloadVersions();
    });
  }

  validateVersion(id: string) {
    this.validationErrors = [];
    this.timetableSvc.validate(id).subscribe(errors => this.validationErrors = errors);
  }

  publishVersion(id: string) {
    this.timetableSvc.publish(id).subscribe(() => this.reloadVersions());
  }

  archiveVersion(id: string) {
    this.timetableSvc.archive(id).subscribe(() => this.reloadVersions());
  }

  loadEntries(versionId: string) {
    this.selectedVersionId = versionId;
    const v = this.versions.find(x => x.id === versionId);
    this.selectedVersionStatus = v?.status ?? null;
    this.timetableSvc.getEntries(versionId).subscribe(e => this.entries = e);
  }

  removeEntry(id: string) {
    this.timetableSvc.removeEntry(id).subscribe(() => {
      if (this.selectedVersionId) this.loadEntries(this.selectedVersionId);
      this.reloadVersions();
    });
  }

  addEntry() {
    this.addEntryError = '';
    if (!this.selectedVersionId || !this.entryForm.periodDefinitionId || !this.entryForm.subjectId || !this.entryForm.teacherProfileId || !this.entryForm.roomId) {
      this.addEntryError = 'Please fill in all fields.';
      return;
    }
    const req: AddTimetableEntryRequest = {
      timetableVersionId: this.selectedVersionId,
      dayOfWeek: this.entryForm.dayOfWeek,
      periodDefinitionId: this.entryForm.periodDefinitionId,
      subjectId: this.entryForm.subjectId,
      teacherProfileId: this.entryForm.teacherProfileId,
      roomId: this.entryForm.roomId
    };
    this.timetableSvc.addEntry(req).subscribe({
      next: () => {
        this.loadEntries(this.selectedVersionId!);
        this.reloadVersions();
        this.entryForm = { dayOfWeek: this.entryForm.dayOfWeek, periodDefinitionId: '', subjectId: '', teacherProfileId: '', roomId: '' };
      },
      error: (err: any) => {
        this.addEntryError = err?.error?.message || err?.error || 'Failed to add entry.';
      }
    });
  }

  dayName(d: number): string {
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d] || '';
  }
}
