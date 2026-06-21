import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '@core/services/data.service';
import { RoomDto } from '@core/models';
import { RoomType } from '@core/models/enums';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { I18nService } from '@core/i18n/i18n.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="page-header"><h1>{{ 'Rooms' | t }}</h1>
      <button class="btn btn-primary" (click)="showForm=!showForm">{{ (showForm ? 'Cancel' : '+ Add Room') | t }}</button>
    </div>

    <div class="alert alert-danger" *ngIf="error">{{error}}</div>
    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">{{ (editId ? 'Edit Room' : 'Add Room') | t }}</h4>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>{{ 'Code' | t }}</label><input [(ngModel)]="form.code" [placeholder]="'e.g. Room101' | t" /></div>
          <div class="form-group"><label>{{ 'Name (English)' | t }}</label><input [(ngModel)]="form.name" [placeholder]="'e.g. Room 101' | t" /></div>
          <div class="form-group"><label>{{ 'Name (Arabic)' | t }}</label><input [(ngModel)]="form.nameAr" placeholder="مثال: قاعة 101" dir="rtl" /></div>
          <div class="form-group"><label>{{ 'Type' | t }}</label>
            <select [(ngModel)]="form.roomType">
              <option *ngFor="let t of roomTypes" [value]="t">{{t}}</option>
            </select>
          </div>
          <div class="form-group"><label>{{ 'Building' | t }}</label><input [(ngModel)]="form.building" [placeholder]="'e.g. Main Building' | t" /></div>
          <div class="form-group"><label>{{ 'Floor' | t }}</label><input type="number" [(ngModel)]="form.floor" /></div>
          <div class="form-group"><label>{{ 'Capacity' | t }}</label><input type="number" [(ngModel)]="form.capacity" min="1" /></div>
        </div>
        <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ (saving ? 'Saving...' : 'Save') | t }}</button>
        <button class="btn btn-default" (click)="cancelEdit()">{{ 'Cancel' | t }}</button>
      </div>
    </div>

    <!-- Filter -->
    <div class="card">
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>{{ 'Filter by Type' | t }}</label>
            <select [(ngModel)]="filterType" (ngModelChange)="load()">
              <option value="">{{ 'All Types' | t }}</option>
              <option *ngFor="let t of roomTypes" [value]="t">{{t}}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header card-header-info">
        <h4 class="card-title">{{ 'All Rooms' | t }}</h4>
        <p class="card-category">{{ '{count} room(s)' | t:{ count: items.length } }}</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>{{ 'Code' | t }}</th><th>{{ 'Name' | t }}</th><th>{{ 'Type' | t }}</th><th>{{ 'Building' | t }}</th><th>{{ 'Floor' | t }}</th><th>{{ 'Capacity' | t }}</th><th>{{ 'Actions' | t }}</th></tr></thead>
            <tbody>
              <tr *ngIf="!items.length"><td colspan="7" class="text-center">{{ 'No rooms found.' | t }}</td></tr>
              <tr *ngFor="let r of items">
                <td>{{r.code}}</td>
                <td>
                  {{ i18n.lang() === 'ar' && r.nameAr ? r.nameAr : r.name }}
                  <span *ngIf="i18n.lang() === 'ar' && !r.nameAr" style="color:#f59e0b;font-size:0.75rem;margin-inline-start:4px">{{ '(no Arabic name)' | t }}</span>
                </td>
                <td>{{r.roomType}}</td><td>{{r.building ?? '-'}}</td><td>{{r.floor ?? '-'}}</td><td>{{r.capacity ?? '-'}}</td>
                <td>
                  <button class="btn btn-sm btn-info" (click)="edit(r)">{{ 'Edit' | t }}</button>
                  <button class="btn btn-sm btn-danger" (click)="remove(r.id)">{{ 'Delete' | t }}</button>
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
export class RoomsComponent implements OnInit {
  items: RoomDto[] = [];
  showForm = false;
  form: any = { roomType: 'Classroom' };
  editId: string | null = null;
  filterType = '';
  roomTypes = Object.values(RoomType);
  saving = false;
  error = '';
  readonly i18n = inject(I18nService);

  constructor(private svc: RoomService) {}

  ngOnInit() { this.load(); }

  load() {
    this.svc.getAll(this.filterType as RoomType || undefined).subscribe({ next: d => this.items = d, error: () => this.error = 'Failed to load rooms.' });
  }

  save() {
    this.saving = true; this.error = '';
    const obs = this.editId
      ? this.svc.update(this.editId, this.form)
      : this.svc.create(this.form);
    obs.subscribe({ next: () => { this.saving = false; this.cancelEdit(); this.load(); }, error: () => { this.saving = false; this.error = 'Failed to save room.'; } });
  }

  edit(r: RoomDto) {
    this.editId = r.id;
    this.form = { code: r.code, name: r.name, nameAr: r.nameAr || '', roomType: r.roomType, building: r.building, floor: r.floor, capacity: r.capacity };
    this.showForm = true;
    this.error = '';
  }

  cancelEdit() { this.editId = null; this.form = { roomType: 'Classroom' }; this.showForm = false; this.error = ''; }

  remove(id: string) {
    if (!confirm('Delete this room?')) return;
    this.svc.delete(id).subscribe({ next: () => this.load(), error: () => this.error = 'Failed to delete room.' });
  }
}
