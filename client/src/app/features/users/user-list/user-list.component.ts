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
      <button class="btn btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Cancel' : '+ Add User' }}</button>
    </div>

    <div class="card form-card" *ngIf="showForm">
      <div class="card-header card-header-info">
        <h4 class="card-title">Create User</h4>
        <p class="card-category">Add a new staff or student account</p>
      </div>
      <div class="card-body">
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
        <button class="btn btn-primary" (click)="create()">Create</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header card-header-primary">
        <h4 class="card-title">Users</h4>
        <p class="card-category">School staff and student accounts</p>
      </div>
      <div class="card-body">
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
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td>{{ u.fullName }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.role }}</td>
                <td><span [class]="u.isActive ? 'badge-active' : 'badge-inactive'">{{ u.isActive ? 'Active' : 'Inactive' }}</span></td>
                <td>
                  <button class="btn btn-sm btn-danger" *ngIf="u.isActive" (click)="toggleActive(u, false)">Deactivate</button>
                  <button class="btn btn-sm btn-success" *ngIf="!u.isActive" (click)="toggleActive(u, true)">Activate</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
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
