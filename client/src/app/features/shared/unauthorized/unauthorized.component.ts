import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center dark:bg-gray-900">
      <h1 class="mb-2 text-8xl font-bold text-error-500">403</h1>
      <h2 class="mb-2 text-2xl font-bold text-gray-800 dark:text-white">Access Denied</h2>
      <p class="mb-8 text-gray-500 dark:text-gray-400">You don't have permission to access this page.</p>
      <a routerLink="/dashboard"
        class="inline-flex items-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600">
        Go to Dashboard
      </a>
    </div>
  `,
  styles: []
})
export class UnauthorizedComponent {}
