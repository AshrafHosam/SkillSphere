import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '@core/services/data.service';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">Add Class</h4>
        <p class="card-category">Create a new class</p>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Name</label><input [(ngModel)]="form.name" /></div>
          <div class="form-group"><label>Grade</label>
            <select [(ngModel)]="form.gradeId"><option value="">Select</option><option *ngFor="let g of grades" [value]="g.id">{{g.name}}</option></select>
          </div>
          <div class="form-group"><label>Capacity</label><input type="number" [(ngModel)]="form.capacity" /></div>
        </div>
        <button class="btn btn-primary" (click)="save()">Save</button>
        <button class="btn btn-default" (click)="showForm=false">Cancel</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header card-header-info">
        <h4 class="card-title">Classes</h4>
        <p class="card-category">Manage classes and sections</p>
      </div>
      <div class="card-body">
        <button class="btn btn-primary" (click)="showForm=!showForm" style="margin-bottom:15px">{{ showForm ? 'Cancel' : '+ Add' }}</button>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Name</th><th>Grade</th><th>Capacity</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let c of items"><td>{{c.name}}</td><td>{{c.gradeName}}</td><td>{{c.capacity}}</td>
              <td><button class="btn btn-sm btn-danger" (click)="remove(c.id)">Delete</button></td></tr></tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ClassesComponent implements OnInit {
  items: any[] = []; grades: any[] = []; showForm = false; form: any = {};
  constructor(private svc: AcademicService) {}
  ngOnInit() { this.load(); this.svc.getGrades().subscribe(g => this.grades = g); }
  load() { this.svc.getClasses().subscribe(d => this.items = d); }
  save() { this.svc.createClass(this.form).subscribe(() => { this.showForm = false; this.form = {}; this.load(); }); }
  remove(id: string) { this.svc.deleteClass(id).subscribe(() => this.load()); }
}
