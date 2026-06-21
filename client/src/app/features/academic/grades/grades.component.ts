import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '@core/services/data.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { I18nService } from '@core/i18n/i18n.service';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="alert alert-danger" *ngIf="error">{{error}}</div>
    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">{{ (editId ? 'Edit Grade' : 'Add Grade') | t }}</h4>
        <p class="card-category">{{ (editId ? 'Update grade details' : 'Create a new grade level') | t }}</p>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>{{ 'Name (English)' | t }}</label><input [(ngModel)]="form.name" [placeholder]="'e.g. Grade 1' | t" /></div>
          <div class="form-group"><label>{{ 'Name (Arabic)' | t }}</label><input [(ngModel)]="form.nameAr" placeholder="مثال: الصف الأول" dir="rtl" /></div>
          <div class="form-group"><label>{{ 'Order Index' | t }}</label><input type="number" [(ngModel)]="form.orderIndex" min="1" /></div>
        </div>
        <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ (saving ? 'Saving...' : 'Save') | t }}</button>
        <button class="btn btn-default" (click)="cancelForm()">{{ 'Cancel' | t }}</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header card-header-success">
        <h4 class="card-title">{{ 'Grades' | t }}</h4>
        <p class="card-category">{{ 'Manage grade levels' | t }}</p>
      </div>
      <div class="card-body">
        <button class="btn btn-primary" (click)="openAdd()" style="margin-bottom:15px">{{ '+ Add' | t }}</button>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>{{ 'Name' | t }}</th><th>{{ 'Order' | t }}</th><th>{{ 'Actions' | t }}</th></tr></thead>
            <tbody>
              <tr *ngIf="!items.length"><td colspan="3" class="text-center">{{ 'No grades found.' | t }}</td></tr>
              <tr *ngFor="let g of items">
                <td>
                  {{ i18n.lang() === 'ar' && g.nameAr ? g.nameAr : g.name }}
                  <span *ngIf="i18n.lang() === 'ar' && !g.nameAr" style="color:#f59e0b;font-size:0.75rem;margin-inline-start:4px">{{ '(no Arabic name)' | t }}</span>
                </td>
                <td>{{g.orderIndex}}</td>
                <td>
                  <button class="btn btn-sm btn-info" (click)="openEdit(g)" style="margin-inline-end:4px">{{ 'Edit' | t }}</button>
                  <button class="btn btn-sm btn-danger" (click)="remove(g.id)">{{ 'Delete' | t }}</button>
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
export class GradesComponent implements OnInit {
  items: any[] = []; showForm = false; editId: string | null = null; form: any = {};
  saving = false; error = '';
  readonly i18n = inject(I18nService);
  constructor(private svc: AcademicService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getGrades().subscribe({ next: d => this.items = d, error: () => this.error = 'Failed to load grades.' }); }
  openAdd() { this.editId = null; this.form = {}; this.showForm = true; this.error = ''; }
  openEdit(g: any) { this.editId = g.id; this.form = { name: g.name, nameAr: g.nameAr || '', orderIndex: g.orderIndex }; this.showForm = true; this.error = ''; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  cancelForm() { this.showForm = false; this.editId = null; this.form = {}; this.error = ''; }
  save() {
    this.saving = true; this.error = '';
    const obs = this.editId ? this.svc.updateGrade(this.editId, this.form) : this.svc.createGrade(this.form);
    obs.subscribe({ next: () => { this.saving = false; this.cancelForm(); this.load(); }, error: () => { this.saving = false; this.error = 'Failed to save grade.'; } });
  }
  remove(id: string) {
    if (!confirm('Delete this grade?')) return;
    this.svc.deleteGrade(id).subscribe({ next: () => this.load(), error: () => this.error = 'Failed to delete grade.' });
  }
}
