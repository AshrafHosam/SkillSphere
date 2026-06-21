import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurriculumService, AcademicService } from '@core/services/data.service';
import { CurriculumContractDto } from '@core/models';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="page-header"><h1>{{ 'Curriculum Contracts' | t }}</h1>
      <button class="btn btn-primary" (click)="showForm=!showForm">{{ (showForm ? 'Cancel' : '+ Add Contract') | t }}</button>
    </div>

    <div class="alert alert-danger" *ngIf="error">{{error}}</div>
    <div class="card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">{{ 'Add Curriculum Contract' | t }}</h4>
        <p class="card-category">{{ 'Assign a subject to a grade for a semester with weekly hours' | t }}</p>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>{{ 'Grade' | t }}</label>
            <select [(ngModel)]="form.gradeId"><option value="">{{ 'Select' | t }}</option><option *ngFor="let g of grades" [value]="g.id">{{g.name}}</option></select>
          </div>
          <div class="form-group"><label>{{ 'Semester' | t }}</label>
            <select [(ngModel)]="form.semesterId"><option value="">{{ 'Select' | t }}</option><option *ngFor="let s of semesters" [value]="s.id">{{s.name}}</option></select>
          </div>
          <div class="form-group"><label>{{ 'Subject' | t }}</label>
            <select [(ngModel)]="form.subjectId"><option value="">{{ 'Select' | t }}</option><option *ngFor="let s of subjects" [value]="s.id">{{s.name}}</option></select>
          </div>
          <div class="form-group"><label>{{ 'Periods Per Week' | t }}</label><input type="number" [(ngModel)]="form.periodsPerWeek" min="1" /></div>
        </div>
        <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ (saving ? 'Saving...' : 'Save') | t }}</button>
        <button class="btn btn-default" (click)="showForm=false; error=''">{{ 'Cancel' | t }}</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label>{{ 'Filter by Grade' | t }}</label>
            <select [(ngModel)]="filterGradeId" (ngModelChange)="load()"><option value="">{{ 'All' | t }}</option><option *ngFor="let g of grades" [value]="g.id">{{g.name}}</option></select>
          </div>
          <div class="form-group"><label>{{ 'Filter by Semester' | t }}</label>
            <select [(ngModel)]="filterSemesterId" (ngModelChange)="load()"><option value="">{{ 'All' | t }}</option><option *ngFor="let s of semesters" [value]="s.id">{{s.name}}</option></select>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header card-header-info">
        <h4 class="card-title">{{ 'Curriculum Contracts' | t }}</h4>
        <p class="card-category">{{ '{count} contract(s)' | t:{ count: items.length } }}</p>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>{{ 'Grade' | t }}</th><th>{{ 'Semester' | t }}</th><th>{{ 'Subject' | t }}</th><th>{{ 'Periods Per Week' | t }}</th><th>{{ 'Actions' | t }}</th></tr></thead>
            <tbody>
              <tr *ngIf="!items.length"><td colspan="5" class="text-center">{{ 'No contracts found.' | t }}</td></tr>
              <tr *ngFor="let c of items">
                <td>{{c.gradeName}}</td><td>{{c.semesterName}}</td><td>{{c.subjectName}}</td><td>{{c.periodsPerWeek}}</td>
                <td><button class="btn btn-sm btn-danger" (click)="remove(c.id)">{{ 'Remove' | t }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class CurriculumComponent implements OnInit {
  items: CurriculumContractDto[] = [];
  grades: any[] = [];
  semesters: any[] = [];
  subjects: any[] = [];
  showForm = false;
  form: any = {};
  filterGradeId = '';
  filterSemesterId = '';
  saving = false;
  error = '';

  constructor(private svc: CurriculumService, private academicSvc: AcademicService) {}

  ngOnInit() {
    this.load();
    this.academicSvc.getGrades().subscribe(g => this.grades = g);
    this.academicSvc.getSemesters().subscribe(s => this.semesters = s);
    this.academicSvc.getSubjects().subscribe(s => this.subjects = s);
  }

  load() {
    this.svc.getContracts(this.filterGradeId || undefined, this.filterSemesterId || undefined)
      .subscribe({ next: d => this.items = d, error: () => this.error = 'Failed to load contracts.' });
  }

  save() {
    if (!this.form.periodsPerWeek || this.form.periodsPerWeek < 1) {
      this.error = 'Periods per week must be at least 1.';
      return;
    }
    this.saving = true; this.error = '';
    this.svc.setContract(this.form).subscribe({
      next: () => { this.saving = false; this.showForm = false; this.form = {}; this.load(); },
      error: () => { this.saving = false; this.error = 'Failed to save contract.'; }
    });
  }

  remove(id: string) {
    if (!confirm('Remove this contract?')) return;
    this.svc.removeContract(id).subscribe({ next: () => this.load(), error: () => this.error = 'Failed to remove contract.' });
  }
}
