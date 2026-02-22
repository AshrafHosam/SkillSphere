import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggleTheme()"
      class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      @if ((theme$ | async) === 'dark') {
        <svg class="fill-current" width="20" height="20" viewBox="0 0 20 20"><path d="M10 2.917a.625.625 0 0 1 .625.625v1.25a.625.625 0 1 1-1.25 0v-1.25A.625.625 0 0 1 10 2.917ZM10 6.667a3.333 3.333 0 1 0 0 6.666 3.333 3.333 0 0 0 0-6.666Zm0 1.25a2.083 2.083 0 1 1 0 4.166 2.083 2.083 0 0 1 0-4.166ZM10 15.208a.625.625 0 0 1 .625.625v1.25a.625.625 0 1 1-1.25 0v-1.25a.625.625 0 0 1 .625-.625ZM2.917 10a.625.625 0 0 1 .625-.625h1.25a.625.625 0 0 1 0 1.25h-1.25A.625.625 0 0 1 2.917 10ZM15.208 10a.625.625 0 0 1 .625-.625h1.25a.625.625 0 1 1 0 1.25h-1.25a.625.625 0 0 1-.625-.625ZM4.877 4.877a.625.625 0 0 1 .884 0l.884.884a.625.625 0 0 1-.884.884l-.884-.884a.625.625 0 0 1 0-.884ZM13.355 13.355a.625.625 0 0 1 .884 0l.884.884a.625.625 0 1 1-.884.884l-.884-.884a.625.625 0 0 1 0-.884ZM15.123 4.877a.625.625 0 0 1 0 .884l-.884.884a.625.625 0 1 1-.884-.884l.884-.884a.625.625 0 0 1 .884 0ZM6.645 13.355a.625.625 0 0 1 0 .884l-.884.884a.625.625 0 1 1-.884-.884l.884-.884a.625.625 0 0 1 .884 0Z" fill="currentColor"/></svg>
      } @else {
        <svg class="fill-current" width="20" height="20" viewBox="0 0 20 20"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.528 2.5a.625.625 0 0 1 .196.716A6.042 6.042 0 0 0 16.784 10.2a.625.625 0 0 1 .85.696A7.708 7.708 0 1 1 9.098 2.357a.625.625 0 0 1 .43.143Zm-1.278 1.46a6.458 6.458 0 1 0 7.79 7.79 7.292 7.292 0 0 1-7.79-7.79Z" fill="currentColor"/></svg>
      }
    </button>
  `
})
export class ThemeToggleButtonComponent {
  theme$;
  constructor(private themeService: ThemeService) {
    this.theme$ = this.themeService.theme$;
  }
  toggleTheme() { this.themeService.toggleTheme(); }
}
