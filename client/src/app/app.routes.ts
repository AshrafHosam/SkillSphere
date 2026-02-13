import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'tenants',
    canActivate: [roleGuard('PlatformSuperAdmin')],
    loadComponent: () => import('./features/tenants/tenant-list/tenant-list.component').then(m => m.TenantListComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'academic',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'grades', pathMatch: 'full' },
      { path: 'grades', loadComponent: () => import('./features/academic/grades/grades.component').then(m => m.GradesComponent) },
      { path: 'classes', loadComponent: () => import('./features/academic/classes/classes.component').then(m => m.ClassesComponent) },
      { path: 'subjects', loadComponent: () => import('./features/academic/subjects/subjects.component').then(m => m.SubjectsComponent) },
      { path: 'departments', loadComponent: () => import('./features/academic/departments/departments.component').then(m => m.DepartmentsComponent) },
      { path: 'semesters', loadComponent: () => import('./features/academic/semesters/semesters.component').then(m => m.SemestersComponent) },
    ]
  },
  {
    path: 'assignments',
    canActivate: [authGuard],
    loadComponent: () => import('./features/assignments/assignments.component').then(m => m.AssignmentsComponent)
  },
  {
    path: 'timetable',
    canActivate: [authGuard],
    loadComponent: () => import('./features/timetable/timetable.component').then(m => m.TimetableComponent)
  },
  {
    path: 'attendance',
    canActivate: [authGuard],
    loadComponent: () => import('./features/attendance/attendance.component').then(m => m.AttendanceComponent)
  },
  {
    path: 'grades-records',
    canActivate: [authGuard],
    loadComponent: () => import('./features/grades/grades-records.component').then(m => m.GradesRecordsComponent)
  },
  {
    path: 'weekly-reports',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reports/weekly-reports/weekly-reports.component').then(m => m.WeeklyReportsComponent)
  },
  {
    path: 'internal-reports',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reports/internal-reports/internal-reports.component').then(m => m.InternalReportsComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/shared/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
