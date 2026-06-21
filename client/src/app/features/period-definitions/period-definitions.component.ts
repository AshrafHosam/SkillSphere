import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeriodDefinitionService } from '@core/services/data.service';
import { PeriodDefinitionDto } from '@core/models';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-period-definitions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="page-header"><h1>{{ 'Period Definitions' | t }}</h1>
      <button class="btn btn-primary" (click)="showForm=!showForm">{{ (showForm ? 'Cancel' : '+ Add Period') | t }}</button>
    </div>

    <div class="alert alert-danger" *ngIf="error">{{error}}</div>
    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">{{ (editId ? 'Edit Period' : 'Add Period') | t }}</h4>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>{{ 'Period Number' | t }}</label><input type="number" [(ngModel)]="form.periodNumber" min="1" /></div>
          <div class="form-group"><label>{{ 'Label' | t }}</label><input [(ngModel)]="form.label" [placeholder]="'e.g. Period 1' | t" /></div>
          <div class="form-group"><label>{{ 'Start Time' | t }}</label><input type="time" [(ngModel)]="form.startTime" /></div>
          <div class="form-group"><label>{{ 'End Time' | t }}</label><input type="time" [(ngModel)]="form.endTime" /></div>
          <div class="form-group">
            <label>{{ 'Is Break?' | t }}</label>
            <select [(ngModel)]="form.isBreak">
              <option [ngValue]="false">{{ 'No' | t }}</option>
              <option [ngValue]="true">{{ 'Yes' | t }}</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ (saving ? 'Saving...' : 'Save') | t }}</button>
        <button class="btn btn-default" (click)="cancelEdit()">{{ 'Cancel' | t }}</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header card-header-info">
        <h4 class="card-title">{{ 'All Periods' | t }}</h4>
        <p class="card-category">{{ '{count} period(s) defined' | t:{ count: items.length } }}</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>#</th><th>{{ 'Label' | t }}</th><th>{{ 'Start' | t }}</th><th>{{ 'End' | t }}</th><th>{{ 'Break?' | t }}</th><th>{{ 'Actions' | t }}</th></tr></thead>
            <tbody>
              <tr *ngIf="!items.length"><td colspan="6" class="text-center">{{ 'No periods defined.' | t }}</td></tr>
              <tr *ngFor="let p of items" [class.break-row]="p.isBreak">
                <td>{{p.periodNumber}}</td><td>{{p.label}}</td><td>{{p.startTime}}</td><td>{{p.endTime}}</td>
                <td>{{ (p.isBreak ? 'Yes' : 'No') | t }}</td>
                <td>
                  <button class="btn btn-sm btn-info" (click)="edit(p)">{{ 'Edit' | t }}</button>
                  <button class="btn btn-sm btn-danger" (click)="remove(p.id)">{{ 'Delete' | t }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; } .break-row { background: #fff3e0; }`]
})
export class PeriodDefinitionsComponent implements OnInit {
  items: PeriodDefinitionDto[] = [];
  showForm = false;
  form: any = { isBreak: false };
  editId: string | null = null;
  saving = false;
  error = '';

  constructor(private svc: PeriodDefinitionService) {}

  ngOnInit() { this.load(); }

  load() { this.svc.getAll().subscribe({ next: d => this.items = d, error: () => this.error = 'Failed to load periods.' }); }

  save() {
    this.saving = true; this.error = '';
    const obs = this.editId
      ? this.svc.update(this.editId, this.form)
      : this.svc.create(this.form);
    obs.subscribe({ next: () => { this.saving = false; this.cancelEdit(); this.load(); }, error: () => { this.saving = false; this.error = 'Failed to save period.'; } });
  }

  edit(p: PeriodDefinitionDto) {
    this.editId = p.id;
    this.form = { periodNumber: p.periodNumber, label: p.label, startTime: p.startTime, endTime: p.endTime, isBreak: p.isBreak };
    this.showForm = true;
    this.error = '';
  }

  cancelEdit() { this.editId = null; this.form = { isBreak: false }; this.showForm = false; this.error = ''; }

  remove(id: string) {
    if (!confirm('Delete this period?')) return;
    this.svc.delete(id).subscribe({ next: () => this.load(), error: () => this.error = 'Failed to delete period.' });
  }
}
