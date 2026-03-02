import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '@core/services/data.service';
import { LocalDatePipe } from '@core/pipes/local-date.pipe';

@Component({
  selector: 'app-semesters',
  standalone: true,
  imports: [CommonModule, FormsModule, LocalDatePipe],
  template: `
    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">Add Semester</h4>
        <p class="card-category">Create a new semester</p>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Name</label><input [(ngModel)]="form.name" /></div>
          <div class="form-group"><label>Start Date</label><input type="date" [(ngModel)]="form.startDate" /></div>
          <div class="form-group"><label>End Date</label><input type="date" [(ngModel)]="form.endDate" /></div>
        </div>
        <button class="btn btn-primary" (click)="save()">Save</button>
        <button class="btn btn-default" (click)="showForm=false">Cancel</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header card-header-primary">
        <h4 class="card-title">Semesters</h4>
        <p class="card-category">Manage academic semesters</p>
      </div>
      <div class="card-body">
        <button class="btn btn-primary" (click)="showForm=!showForm" style="margin-bottom:15px">{{ showForm ? 'Cancel' : '+ Add' }}</button>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Name</th><th>Start</th><th>End</th><th>Current</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let s of items"><td>{{s.name}}</td><td>{{s.startDate | localDate:'mediumDate'}}</td><td>{{s.endDate | localDate:'mediumDate'}}</td>
              <td><span [class]="s.isCurrent ? 'badge-active' : ''">{{s.isCurrent ? 'Yes' : 'No'}}</span></td>
              <td><button class="btn btn-sm btn-danger" (click)="remove(s.id)">Delete</button></td></tr></tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class SemestersComponent implements OnInit {
  items: any[] = []; showForm = false; form: any = {};
  constructor(private svc: AcademicService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getSemesters().subscribe(d => this.items = d); }
  save() { this.svc.createSemester(this.form).subscribe(() => { this.showForm = false; this.form = {}; this.load(); }); }
  remove(id: string) { this.svc.deleteSemester(id).subscribe(() => this.load()); }
}
