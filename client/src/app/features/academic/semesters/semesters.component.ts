import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '@core/services/data.service';
import { LocalDatePipe } from '@core/pipes/local-date.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { I18nService } from '@core/i18n/i18n.service';

@Component({
  selector: 'app-semesters',
  standalone: true,
  imports: [CommonModule, FormsModule, LocalDatePipe, TranslatePipe],
  template: `
    <div class="alert alert-danger" *ngIf="error">{{error}}</div>
    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">{{ (editId ? 'Edit Semester' : 'Add Semester') | t }}</h4>
        <p class="card-category">{{ (editId ? 'Update semester details' : 'Create a new semester') | t }}</p>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group">
            <label>{{ 'Name (English)' | t }}</label>
            <input [(ngModel)]="form.name" [placeholder]="'e.g. 2025-2026 Term 1' | t" />
          </div>
          <div class="form-group">
            <label>{{ 'Name (Arabic)' | t }}</label>
            <input [(ngModel)]="form.nameAr" placeholder="مثال: الفصل الأول 2025-2026" dir="rtl" />
          </div>
          <div class="form-group"><label>{{ 'Start Date' | t }}</label><input type="date" [(ngModel)]="form.startDate" /></div>
          <div class="form-group"><label>{{ 'End Date' | t }}</label><input type="date" [(ngModel)]="form.endDate" /></div>
          <div class="form-group" style="display:flex;align-items:center;gap:8px;padding-top:24px">
            <input type="checkbox" [(ngModel)]="form.isCurrent" id="isCurrentChk" />
            <label for="isCurrentChk" style="margin:0;cursor:pointer">{{ 'Mark as Current Semester' | t }}</label>
          </div>
        </div>
        <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ (saving ? 'Saving...' : 'Save') | t }}</button>
        <button class="btn btn-default" (click)="cancelForm()">{{ 'Cancel' | t }}</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header card-header-primary">
        <h4 class="card-title">{{ 'Semesters' | t }}</h4>
        <p class="card-category">{{ 'Manage academic semesters' | t }}</p>
      </div>
      <div class="card-body">
        <button class="btn btn-primary" (click)="openAdd()" style="margin-bottom:15px">{{ '+ Add' | t }}</button>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>{{ 'Name' | t }}</th><th>{{ 'Start' | t }}</th><th>{{ 'End' | t }}</th><th>{{ 'Current' | t }}</th><th>{{ 'Actions' | t }}</th></tr></thead>
            <tbody>
              <tr *ngIf="!items.length"><td colspan="5" class="text-center">{{ 'No semesters found.' | t }}</td></tr>
              <tr *ngFor="let s of items">
                <td>
                  {{ i18n.lang() === 'ar' && s.nameAr ? s.nameAr : s.name }}
                  <span *ngIf="i18n.lang() === 'ar' && !s.nameAr" style="color:#f59e0b;font-size:0.75rem;margin-inline-start:4px">{{ '(no Arabic name)' | t }}</span>
                </td>
                <td>{{s.startDate | localDate:'mediumDate'}}</td>
                <td>{{s.endDate | localDate:'mediumDate'}}</td>
                <td><span [class]="s.isCurrent ? 'badge-active' : ''">{{ (s.isCurrent ? 'Yes' : 'No') | t }}</span></td>
                <td>
                  <button class="btn btn-sm btn-info" (click)="openEdit(s)" style="margin-inline-end:4px">{{ 'Edit' | t }}</button>
                  <button class="btn btn-sm btn-danger" (click)="remove(s.id)">{{ 'Delete' | t }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class SemestersComponent implements OnInit {
  items: any[] = [];
  showForm = false;
  editId: string | null = null;
  form: any = {};
  saving = false;
  error = '';
  readonly i18n = inject(I18nService);
  constructor(private svc: AcademicService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getSemesters().subscribe({ next: d => this.items = d, error: () => this.error = 'Failed to load semesters.' }); }

  openAdd() { this.editId = null; this.form = {}; this.showForm = true; this.error = ''; }

  openEdit(s: any) {
    this.editId = s.id;
    this.form = {
      name: s.name,
      nameAr: s.nameAr || '',
      startDate: s.startDate?.split('T')[0],
      endDate: s.endDate?.split('T')[0],
      isCurrent: s.isCurrent
    };
    this.showForm = true;
    this.error = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm() { this.showForm = false; this.editId = null; this.form = {}; this.error = ''; }

  save() {
    if (this.form.startDate && this.form.endDate && this.form.endDate <= this.form.startDate) {
      this.error = 'End date must be after start date.';
      return;
    }
    this.saving = true; this.error = '';
    const obs = this.editId
      ? this.svc.updateSemester(this.editId, this.form)
      : this.svc.createSemester(this.form);
    obs.subscribe({ next: () => { this.saving = false; this.cancelForm(); this.load(); }, error: () => { this.saving = false; this.error = 'Failed to save semester.'; } });
  }

  remove(id: string) {
    if (!confirm('Delete this semester?')) return;
    this.svc.deleteSemester(id).subscribe({ next: () => this.load(), error: () => this.error = 'Failed to delete semester.' });
  }
}
