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
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-white/90">Users</h1>
      <button
        class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
        (click)="showForm = !showForm">
        {{ showForm ? 'Cancel' : '+ Add User' }}
      </button>
    </div>

    <!-- Create User Form -->
    <div *ngIf="showForm"
      class="mb-4 rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 class="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Create User</h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Email</label>
          <input [(ngModel)]="form.email"
            class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Password</label>
          <input type="password" [(ngModel)]="form.password"
            class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">First Name</label>
          <input [(ngModel)]="form.firstName"
            class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Last Name</label>
          <input [(ngModel)]="form.lastName"
            class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Role</label>
          <select [(ngModel)]="form.role"
            class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
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

      <div class="mt-4">
        <button
          class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
          (click)="create()">
          Create
        </button>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <!-- Filter Row -->
      <div class="mb-4 p-5 pb-0 lg:p-6 lg:pb-0">
        <select [(ngModel)]="filter.role" (change)="load()"
          class="h-11 w-48 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
          <option value="">All Roles</option>
          <option value="SchoolAdmin">Admin</option>
          <option value="SchoolManager">Manager</option>
          <option value="Teacher">Teacher</option>
          <option value="TeacherSupervisor">Supervisor</option>
          <option value="Parent">Parent</option>
          <option value="Student">Student</option>
        </select>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800">
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr *ngFor="let u of users" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ u.fullName }}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ u.email }}</td>
              <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ u.role }}</td>
              <td class="px-5 py-3 text-sm">
                <span *ngIf="u.isActive"
                  class="inline-flex rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/10 dark:text-success-400">
                  Active
                </span>
                <span *ngIf="!u.isActive"
                  class="inline-flex rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/10 dark:text-error-400">
                  Inactive
                </span>
              </td>
              <td class="px-5 py-3 text-sm">
                <button *ngIf="u.isActive" (click)="toggleActive(u, false)"
                  class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                  Deactivate
                </button>
                <button *ngIf="!u.isActive" (click)="toggleActive(u, true)"
                  class="rounded-lg bg-success-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-success-600">
                  Activate
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
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
