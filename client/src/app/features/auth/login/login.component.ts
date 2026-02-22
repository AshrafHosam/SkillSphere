import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500">
            <span class="text-2xl font-bold text-white">SS</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">SkillSphere</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">School Management Platform</p>
        </div>
        <form (ngSubmit)="onLogin()">
          <div class="mb-5">
            <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required
              placeholder="admin&#64;school.com"
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
          </div>
          <div class="mb-5">
            <label class="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required
              placeholder="••••••••"
              class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
          </div>
          <div *ngIf="error" class="mb-4 rounded-lg bg-error-50 p-3 text-sm font-medium text-error-600 dark:bg-error-500/10 dark:text-error-400">
            {{ error }}
          </div>
          <button type="submit" [disabled]="loading"
            class="flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn) this.router.navigate(['/dashboard']);
  }

  onLogin(): void {
    this.loading = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.error || 'Invalid credentials';
      }
    });
  }
}
