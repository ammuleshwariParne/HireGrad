import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-home',
  standalone: true,
  template: `
    <div class="flex min-h-screen items-center justify-center p-6">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card dark:border-slate-800 dark:bg-slate-900">
        <p class="text-sm font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">Student</p>
        <h1 class="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          Welcome, {{ auth.user()?.fullName }}
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your student dashboard will appear here next.
        </p>
        <button
          (click)="logout()"
          class="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Log out
        </button>
      </div>
    </div>
  `,
})
export class StudentHomeComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}