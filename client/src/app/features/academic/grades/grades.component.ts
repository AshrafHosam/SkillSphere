import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '@core/services/data.service';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">Add Grade</h4>
        <p class="card-category">Create a new grade level</p>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Name</label><input [(ngModel)]="form.name" /></div>
          <div class="form-group"><label>Order Index</label><input type="number" [(ngModel)]="form.orderIndex" /></div>
        </div>
        <button class="btn btn-primary" (click)="save()">Save</button>
        <button class="btn btn-default" (click)="showForm=false">Cancel</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header card-header-success">
        <h4 class="card-title">Grades</h4>
        <p class="card-category">Manage grade levels</p>
      </div>
      <div class="card-body">
        <button class="btn btn-primary" (click)="showForm=!showForm" style="margin-bottom:15px">{{ showForm ? 'Cancel' : '+ Add' }}</button>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Name</th><th>Order</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let g of items"><td>{{g.name}}</td><td>{{g.orderIndex}}</td>
              <td><button class="btn btn-sm btn-danger" (click)="remove(g.id)">Delete</button></td></tr></tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class GradesComponent implements OnInit {
  items: any[] = []; showForm = false; form: any = {};
  constructor(private svc: AcademicService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getGrades().subscribe(d => this.items = d); }
  save() { this.svc.createGrade(this.form).subscribe(() => { this.showForm = false; this.form = {}; this.load(); }); }
  remove(id: string) { this.svc.deleteGrade(id).subscribe(() => this.load()); }
}
