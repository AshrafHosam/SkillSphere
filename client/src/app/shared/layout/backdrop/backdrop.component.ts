import { Component } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-backdrop',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isMobileOpen$ | async) {
    <div class="fixed inset-0 z-40 bg-gray-900/50 xl:hidden" (click)="closeSidebar()"></div>
    }
  `
})
export class BackdropComponent {
  readonly isMobileOpen$;
  constructor(private sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }
  closeSidebar() { this.sidebarService.setMobileOpen(false); }
}
