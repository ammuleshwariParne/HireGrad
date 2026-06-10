import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'student',
    canActivate: [authGuard, roleGuard('STUDENT')],
    loadComponent: () =>
      import('./features/student/student-home/student-home.component').then(
        (m) => m.StudentHomeComponent
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ADMIN')],
    loadComponent: () =>
      import('./features/admin/admin-home/admin-home.component').then(
        (m) => m.AdminHomeComponent
      ),
  },
  { path: '**', redirectTo: 'login' },
];