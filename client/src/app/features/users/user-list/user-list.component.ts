import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '@core/services/data.service';
import { UserDto } from '@core/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Users</h1>
      <button class="btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Cancel' : '+ Add User' }}</button>
    </div>

    <div class="card form-card" *ngIf="showForm">
      <h3>Create User</h3>
      <div class="form-row">
        <div class="form-group"><label>Email</label><input [(ngModel)]="form.email" /></div>
        <div class="form-group"><label>Password</label><input type="password" [(ngModel)]="form.password" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>First Name</label><input [(ngModel)]="form.firstName" /></div>
        <div class="form-group"><label>Last Name</label><input [(ngModel)]="form.lastName" /></div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Role</label>
          <select [(ngModel)]="form.role">
            <option value="">Select Role</option>
            <option value="SchoolAdmin">School Admin</option>
            <option value="SchoolManager">School Manager</option>
            <option value="Teacher">Teacher</option>
            <option value="TeacherSupervisor">Teacher Supervisor</option>
            <option value="Parent">Parent</option>
            <option value="Student">Student</option>
          </select>
        </div>
      </div>
      <button class="btn-primary" (click)="create()">Create</button>
    </div>

    <div class="card">
      <div class="filter-row">
        <select [(ngModel)]="filter.role" (change)="load()">
          <option value="">All Roles</option>
          <option value="SchoolAdmin">Admin</option>
          <option value="SchoolManager">Manager</option>
          <option value="Teacher">Teacher</option>
          <option value="TeacherSupervisor">Supervisor</option>
          <option value="Parent">Parent</option>
          <option value="Student">Student</option>
        </select>
      </div>
      <table class="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td>{{ u.fullName }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
            <td><span [class]="u.isActive ? 'badge-active' : 'badge-inactive'">{{ u.isActive ? 'Active' : 'Inactive' }}</span></td>
            <td>
              <button class="btn-sm" *ngIf="u.isActive" (click)="toggleActive(u, false)">Deactivate</button>
              <button class="btn-sm btn-success" *ngIf="!u.isActive" (click)="toggleActive(u, true)">Activate</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; }
    .btn-primary { padding: 0.5rem 1rem; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .btn-sm { padding: 0.25rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer; font-size: 0.8rem; background: white; }
    .btn-success { background: #22c55e; color: white; border: none; }
    .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
    .form-card { margin-bottom: 1.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.875rem; color: #334155; }
    .form-group input, .form-group select { width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 4px; box-sizing: border-box; }
    .filter-row { margin-bottom: 1rem; }
    .filter-row select { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 4px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { font-weight: 600; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
    .badge-active { background: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }
    .badge-inactive { background: #fef2f2; color: #991b1b; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }
  `]
})
export class UserListComponent implements OnInit {
  users: UserDto[] = [];
  showForm = false;
  form: any = {};
  filter: any = { role: '' };

  constructor(private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.userService.getAll(this.filter.role ? { role: this.filter.role } : {}).subscribe(r => this.users = r.items || []);
  }

  create(): void {
    this.userService.create(this.form).subscribe(() => { this.showForm = false; this.form = {}; this.load(); });
  }

  toggleActive(user: UserDto, activate: boolean): void {
    const obs = activate ? this.userService.activate(user.id) : this.userService.deactivate(user.id);
    obs.subscribe(() => this.load());
  }
}
