import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '@core/services/data.service';
import { RoomDto } from '@core/models';
import { RoomType } from '@core/models/enums';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Rooms</h1>
      <button class="btn btn-primary" (click)="showForm=!showForm">{{ showForm ? 'Cancel' : '+ Add Room' }}</button>
    </div>

    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">{{ editId ? 'Edit' : 'Add' }} Room</h4>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Code</label><input [(ngModel)]="form.code" placeholder="e.g. Room101" /></div>
          <div class="form-group"><label>Name</label><input [(ngModel)]="form.name" placeholder="e.g. Room 101" /></div>
          <div class="form-group"><label>Type</label>
            <select [(ngModel)]="form.roomType">
              <option *ngFor="let t of roomTypes" [value]="t">{{t}}</option>
            </select>
          </div>
          <div class="form-group"><label>Building</label><input [(ngModel)]="form.building" placeholder="e.g. Main Building" /></div>
          <div class="form-group"><label>Floor</label><input type="number" [(ngModel)]="form.floor" /></div>
          <div class="form-group"><label>Capacity</label><input type="number" [(ngModel)]="form.capacity" /></div>
        </div>
        <button class="btn btn-primary" (click)="save()">Save</button>
        <button class="btn btn-default" (click)="cancelEdit()">Cancel</button>
      </div>
    </div>

    <!-- Filter -->
    <div class="card">
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Filter by Type</label>
            <select [(ngModel)]="filterType" (ngModelChange)="load()">
              <option value="">All Types</option>
              <option *ngFor="let t of roomTypes" [value]="t">{{t}}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header card-header-info">
        <h4 class="card-title">All Rooms</h4>
        <p class="card-category">{{items.length}} room(s)</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Building</th><th>Floor</th><th>Capacity</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of items">
                <td>{{r.code}}</td><td>{{r.name}}</td><td>{{r.roomType}}</td><td>{{r.building ?? '-'}}</td><td>{{r.floor ?? '-'}}</td><td>{{r.capacity ?? '-'}}</td>
                <td>
                  <button class="btn btn-sm btn-info" (click)="edit(r)">Edit</button>
                  <button class="btn btn-sm btn-danger" (click)="remove(r.id)">Delete</button>
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

  constructor(private svc: RoomService) {}

  ngOnInit() { this.load(); }

  load() {
    this.svc.getAll(this.filterType as RoomType || undefined).subscribe(d => this.items = d);
  }

  save() {
    if (this.editId) {
      this.svc.update(this.editId, this.form).subscribe(() => { this.cancelEdit(); this.load(); });
    } else {
      this.svc.create(this.form).subscribe(() => { this.cancelEdit(); this.load(); });
    }
  }

  edit(r: RoomDto) {
    this.editId = r.id;
    this.form = { code: r.code, name: r.name, roomType: r.roomType, floor: r.floor, capacity: r.capacity };
    this.showForm = true;
  }

  cancelEdit() { this.editId = null; this.form = { roomType: 'Classroom' }; this.showForm = false; }

  remove(id: string) { this.svc.delete(id).subscribe(() => this.load()); }
}
