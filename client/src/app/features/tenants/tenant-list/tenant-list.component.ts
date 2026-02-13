import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '@core/services/data.service';
import { TenantDto } from '@core/models';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Schools (Tenants)</h1>
      <button class="btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Cancel' : '+ Add School' }}</button>
    </div>

    <div class="card form-card" *ngIf="showForm">
      <h3>Onboard New School</h3>
      <div class="form-row">
        <div class="form-group"><label>School Name</label><input [(ngModel)]="form.name" /></div>
        <div class="form-group"><label>Subdomain</label><input [(ngModel)]="form.code" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Contact Email</label><input [(ngModel)]="form.email" /></div>
        <div class="form-group"><label>Phone</label><input [(ngModel)]="form.phone" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Admin Email</label><input [(ngModel)]="form.adminEmail" /></div>
        <div class="form-group"><label>Admin Password</label><input type="password" [(ngModel)]="form.adminPassword" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Admin First Name</label><input [(ngModel)]="form.adminFirstName" /></div>
        <div class="form-group"><label>Admin Last Name</label><input [(ngModel)]="form.adminLastName" /></div>
      </div>
      <button class="btn-primary" (click)="create()">Create School</button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead><tr><th>School Name</th><th>Subdomain</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let t of tenants">
            <td>{{ t.name }}</td>
            <td>{{ t.code }}</td>
            <td>{{ t.email }}</td>
            <td><span [class]="t.isActive ? 'badge-active' : 'badge-inactive'">{{ t.isActive ? 'Active' : 'Inactive' }}</span></td>
            <td><button class="btn-sm btn-danger" (click)="deactivate(t.id)" *ngIf="t.isActive">Deactivate</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; }
    .btn-primary { padding: 0.5rem 1rem; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .btn-sm { padding: 0.25rem 0.75rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
    .btn-danger { background: #ef4444; color: white; }
    .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
    .form-card { margin-bottom: 1.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.875rem; color: #334155; }
    .form-group input { width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 4px; box-sizing: border-box; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { font-weight: 600; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
    .badge-active { background: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }
    .badge-inactive { background: #fef2f2; color: #991b1b; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }
  `]
})
export class TenantListComponent implements OnInit {
  tenants: TenantDto[] = [];
  showForm = false;
  form: any = {};

  constructor(private tenantService: TenantService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.tenantService.getAll().subscribe(t => this.tenants = t);
  }

  create(): void {
    this.tenantService.create(this.form).subscribe(() => { this.showForm = false; this.form = {}; this.load(); });
  }

  deactivate(id: string): void {
    if (confirm('Deactivate this school?')) {
      this.tenantService.deactivate(id).subscribe(() => this.load());
    }
  }
}
