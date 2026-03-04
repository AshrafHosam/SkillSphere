import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeriodDefinitionService } from '@core/services/data.service';
import { PeriodDefinitionDto } from '@core/models';

@Component({
  selector: 'app-period-definitions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Period Definitions</h1>
      <button class="btn btn-primary" (click)="showForm=!showForm">{{ showForm ? 'Cancel' : '+ Add Period' }}</button>
    </div>

    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">{{ editId ? 'Edit' : 'Add' }} Period</h4>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Period Number</label><input type="number" [(ngModel)]="form.periodNumber" /></div>
          <div class="form-group"><label>Label</label><input [(ngModel)]="form.label" placeholder="e.g. Period 1" /></div>
          <div class="form-group"><label>Start Time</label><input type="time" [(ngModel)]="form.startTime" /></div>
          <div class="form-group"><label>End Time</label><input type="time" [(ngModel)]="form.endTime" /></div>
          <div class="form-group">
            <label>Is Break?</label>
            <select [(ngModel)]="form.isBreak">
              <option [ngValue]="false">No</option>
              <option [ngValue]="true">Yes</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" (click)="save()">Save</button>
        <button class="btn btn-default" (click)="cancelEdit()">Cancel</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header card-header-info">
        <h4 class="card-title">All Periods</h4>
        <p class="card-category">{{items.length}} period(s) defined</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>#</th><th>Label</th><th>Start</th><th>End</th><th>Break?</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of items" [class.break-row]="p.isBreak">
                <td>{{p.periodNumber}}</td><td>{{p.label}}</td><td>{{p.startTime}}</td><td>{{p.endTime}}</td>
                <td>{{p.isBreak ? 'Yes' : 'No'}}</td>
                <td>
                  <button class="btn btn-sm btn-info" (click)="edit(p)">Edit</button>
                  <button class="btn btn-sm btn-danger" (click)="remove(p.id)">Delete</button>
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

  constructor(private svc: PeriodDefinitionService) {}

  ngOnInit() { this.load(); }

  load() { this.svc.getAll().subscribe(d => this.items = d); }

  save() {
    if (this.editId) {
      this.svc.update(this.editId, this.form).subscribe(() => { this.cancelEdit(); this.load(); });
    } else {
      this.svc.create(this.form).subscribe(() => { this.cancelEdit(); this.load(); });
    }
  }

  edit(p: PeriodDefinitionDto) {
    this.editId = p.id;
    this.form = { periodNumber: p.periodNumber, label: p.label, startTime: p.startTime, endTime: p.endTime, isBreak: p.isBreak };
    this.showForm = true;
  }

  cancelEdit() { this.editId = null; this.form = { isBreak: false }; this.showForm = false; }

  remove(id: string) { this.svc.delete(id).subscribe(() => this.load()); }
}
