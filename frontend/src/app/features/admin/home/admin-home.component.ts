import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

type AdminDashboardMock = {
  fullName: string;
  activeJobs: number;
  totalApplicants: number;
  pendingReviews: number;
  studentsPlaced: number;
  eligibleStudents: number;
  events: { label: string; daysAway: number }[];
};

@Component({
  selector: 'app-admin-home',
  imports: [RouterLink, TiltDirective],
  templateUrl: './admin-home.component.html',
})
export class AdminHomeComponent {
  private auth = inject(AuthService);
  private adminService = inject(AdminService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private reduceMotion = this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  auroraX = signal(0);
  auroraY = signal(0);

  // === MOCK ADMIN DASHBOARD — replace with GET /api/admin/me + a dashboard summary API ===
  dashboard = signal<AdminDashboardMock>({
    fullName: this.auth.user()?.fullName ?? 'Placement Cell',
    activeJobs: 6,
    totalApplicants: 142,
    pendingReviews: 18,
    studentsPlaced: 54,
    eligibleStudents: 120,
    events: [
      { label: 'Upcoming drive', daysAway: 1 },
      { label: 'Interview slots', daysAway: 2 },
      { label: 'JD deadline', daysAway: 4 },
    ],
  });

  greeting = this.computeGreeting();
  firstName = computed(() => (this.auth.user()?.fullName ?? this.dashboard().fullName).split(' ')[0]);

  activeJobs = computed(() => this.dashboard().activeJobs);
  totalApplicants = computed(() => this.dashboard().totalApplicants);
  pendingReviews = computed(() => this.dashboard().pendingReviews);

  placementRate = computed(() => {
    const d = this.dashboard();
    return d.eligibleStudents ? Math.round((d.studentsPlaced / d.eligibleStudents) * 100) : 0;
  });

  readonly ringCircumference = 2 * Math.PI * 52;
  ringDashoffset = computed(() => this.ringCircumference * (1 - this.placementRate() / 100));

  summaryCards = computed(() => [
    { label: 'Active job postings', value: this.activeJobs(), icon: 'briefcase', hint: 'Currently open', link: '/admin/jobs' },
    { label: 'Total applicants', value: this.totalApplicants(), icon: 'users', hint: 'Across all drives', link: '/admin/applications' },
    { label: 'Pending reviews', value: this.pendingReviews(), icon: 'clipboard', hint: 'Awaiting your decision', link: '/admin/applications' },
  ]);

  readonly quickActions = [
    { label: 'Post a job', desc: 'Publish a new opening', icon: 'briefcase', link: '/admin/jobs' },
    { label: 'Manage applications', desc: 'Advance students through stages', icon: 'clipboard', link: '/admin/applications' },
    { label: 'Create student account', desc: 'Provision a login for a student', icon: 'user-plus', link: '/admin/students' },
  ];

  constructor() {
    this.adminService.getMe().subscribe({
      next: (me) => this.dashboard.update((d) => ({ ...d, fullName: me.fullName })),
      error: () => {/* fall back to locally stored user */},
    });
  }

  onAuroraMove(e: MouseEvent) {
    if (this.reduceMotion) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.auroraX.set(((e.clientX - r.left) / r.width - 0.5) * 40);
    this.auroraY.set(((e.clientY - r.top) / r.height - 0.5) * 40);
  }
  onAuroraLeave() { this.auroraX.set(0); this.auroraY.set(0); }

  private computeGreeting(): string {
    const h = this.isBrowser ? new Date().getHours() : 9;
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }
}