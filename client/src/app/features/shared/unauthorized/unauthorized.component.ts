import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="unauthorized">
      <h1>403</h1>
      <h2>Access Denied</h2>
      <p>You don't have permission to access this page.</p>
      <a routerLink="/dashboard" class="btn-primary">Go to Dashboard</a>
    </div>
  `,
  styles: [`
    .unauthorized { text-align: center; padding: 4rem 2rem; }
    h1 { font-size: 6rem; margin: 0; color: #ef4444; }
    h2 { margin: 0 0 1rem; color: #0f172a; }
    p { color: #64748b; margin-bottom: 2rem; }
    .btn-primary { padding: .75rem 1.5rem; background: #0f172a; color: white; border-radius: 6px; text-decoration: none; }
  `]
})
export class UnauthorizedComponent {}
