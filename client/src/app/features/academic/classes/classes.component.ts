import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '@core/services/data.service';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Classes</h1>
      <button class="btn-primary" (click)="showForm=!showForm">{{ showForm ? 'Cancel' : '+ Add' }}</button>
    </div>
    <div class="card" *ngIf="showForm">
      <div class="form-row">
        <div class="form-group"><label>Name</label><input [(ngModel)]="form.name" /></div>
        <div class="form-group"><label>Grade</label>
          <select [(ngModel)]="form.gradeId"><option value="">Select</option><option *ngFor="let g of grades" [value]="g.id">{{g.name}}</option></select>
        </div>
        <div class="form-group"><label>Capacity</label><input type="number" [(ngModel)]="form.capacity" /></div>
      </div>
      <button class="btn-primary" (click)="save()">Save</button>
    </div>
    <div class="card"><table class="data-table"><thead><tr><th>Name</th><th>Grade</th><th>Capacity</th><th>Actions</th></tr></thead>
      <tbody><tr *ngFor="let c of items"><td>{{c.name}}</td><td>{{c.gradeName}}</td><td>{{c.capacity}}</td>
        <td><button class="btn-sm btn-danger" (click)="remove(c.id)">Delete</button></td></tr></tbody></table></div>
  `,
  styles: [`.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem}.page-header h1{margin:0}.btn-primary{padding:.5rem 1rem;background:#0f172a;color:#fff;border:none;border-radius:6px;cursor:pointer}.btn-sm{padding:.25rem .75rem;border:none;border-radius:4px;cursor:pointer;font-size:.8rem}.btn-danger{background:#ef4444;color:#fff}.card{background:#fff;padding:1.5rem;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-bottom:1rem}.form-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem}.form-group{margin-bottom:1rem}.form-group label{display:block;margin-bottom:.25rem;font-weight:600;font-size:.875rem;color:#334155}.form-group input,.form-group select{width:100%;padding:.5rem;border:1px solid #e2e8f0;border-radius:4px;box-sizing:border-box}.data-table{width:100%;border-collapse:collapse}.data-table th,.data-table td{padding:.75rem;text-align:left;border-bottom:1px solid #e2e8f0}.data-table th{font-weight:600;color:#64748b;font-size:.8rem;text-transform:uppercase}`]
})
export class ClassesComponent implements OnInit {
  items: any[] = []; grades: any[] = []; showForm = false; form: any = {};
  constructor(private svc: AcademicService) {}
  ngOnInit() { this.load(); this.svc.getGrades().subscribe(g => this.grades = g); }
  load() { this.svc.getClasses().subscribe(d => this.items = d); }
  save() { this.svc.createClass(this.form).subscribe(() => { this.showForm = false; this.form = {}; this.load(); }); }
  remove(id: string) { this.svc.deleteClass(id).subscribe(() => this.load()); }
}
