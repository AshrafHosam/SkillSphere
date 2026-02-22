import { Component } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../app-header/app-header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AppHeaderComponent, AppSidebarComponent, BackdropComponent],
  template: `
    <div class="min-h-screen xl:flex">
      <div>
        <app-sidebar></app-sidebar>
        <app-backdrop></app-backdrop>
      </div>
      <div
        class="flex-1 transition-all duration-300 ease-in-out"
        [ngClass]="{
          'xl:ml-[290px]': (isExpanded$ | async) || (isHovered$ | async),
          'xl:ml-[90px]': !(isExpanded$ | async) && !(isHovered$ | async),
          'ml-0': (isMobileOpen$ | async)
        }"
      >
        <app-header />
        <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AppLayoutComponent {
  readonly isExpanded$;
  readonly isHovered$;
  readonly isMobileOpen$;

  constructor(public sidebarService: SidebarService) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isHovered$ = this.sidebarService.isHovered$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }
}
