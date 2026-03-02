import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  pageTitle = 'Dashboard';
  private routerSub!: Subscription;

  private readonly titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/tenants': 'Schools',
    '/users': 'Users',
    '/academic/grades': 'Grades',
    '/academic/classes': 'Classes',
    '/academic/subjects': 'Subjects',
    '/academic/semesters': 'Semesters',
    '/assignments': 'Assignments',
    '/timetable': 'Timetable',
    '/attendance': 'Attendance',
    '/grades-records': 'Grade Records',
    '/weekly-reports': 'Weekly Reports',
    '/internal-reports': 'Internal Reports',
  };

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.pageTitle = this.titleMap[e.urlAfterRedirects] ?? 'SkillSphere';
      // Auto-close sidebar on mobile navigation
      if (this.sidebarOpen) { this.sidebarOpen = false; }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.auth.logout();
  }
}
