import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '@core/services/data.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">Add Subject</h4>
        <p class="card-category">Create a new subject</p>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>Name</label><input [(ngModel)]="form.name" /></div>
          <div class="form-group"><label>Code</label><input [(ngModel)]="form.code" /></div>
        </div>
        <button class="btn btn-primary" (click)="save()">Save</button>
        <button class="btn btn-default" (click)="showForm=false">Cancel</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header card-header-warning">
        <h4 class="card-title">Subjects</h4>
        <p class="card-category">Manage subject catalog</p>
      </div>
      <div class="card-body">
        <button class="btn btn-primary" (click)="showForm=!showForm" style="margin-bottom:15px">{{ showForm ? 'Cancel' : '+ Add' }}</button>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Name</th><th>Code</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let s of items"><td>{{s.name}}</td><td>{{s.code}}</td>
              <td><button class="btn btn-sm btn-danger" (click)="remove(s.id)">Delete</button></td></tr></tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class SubjectsComponent implements OnInit {
  items: any[] = []; showForm = false; form: any = {};
  constructor(private svc: AcademicService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getSubjects().subscribe(d => this.items = d); }
  save() { this.svc.createSubject(this.form).subscribe(() => { this.showForm = false; this.form = {}; this.load(); }); }
  remove(id: string) { this.svc.deleteSubject(id).subscribe(() => this.load()); }
}
