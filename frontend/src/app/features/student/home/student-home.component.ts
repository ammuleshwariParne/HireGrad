import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StudentService } from '../../../core/services/student.service';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

// Shape of the mock profile that drives the whole page.
type StudentProfileMock = {
  fullName: string;
  course: string;
  passOutYear: number;
  cgpa: number;
  skills: string[];
  profileFields: Record<string, boolean>;
  applications: { status: 'applied' | 'in_progress' | 'selected' | 'rejected' }[];
  eligibleRoles: number;
  events: { type: string; label: string; daysAway: number }[];
};

@Component({
  selector: 'app-student-home',
  imports: [RouterLink, TiltDirective],
  templateUrl: './student-home.component.html',
})
export class StudentHomeComponent {
  private auth = inject(AuthService);
  private studentService = inject(StudentService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private reduceMotion = this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  auroraX = signal(0);
  auroraY = signal(0);

  // ===== MOCK STUDENT — replace with GET /api/student/me + a dashboard summary API =====
  student = signal<StudentProfileMock>({
    fullName: this.auth.user()?.fullName ?? 'Student',
    course: 'Computer Science',
    passOutYear: 2026,
    cgpa: 8.6,
    skills: ['Java', 'Angular', 'SQL', 'Spring Boot'],
    // which profile sections are filled — drives the completeness ring
    profileFields: { photo: true, phone: true, emails: true, address: false, skills: true, academics: true, resume: true, projects: false },
    // small mock collections — counts are derived, never hardcoded in the view
    applications: [{ status: 'in_progress' }, { status: 'in_progress' }, { status: 'in_progress' }, { status: 'applied' }, { status: 'selected' }],
    eligibleRoles: 7,
    events: [
      { type: 'interview', label: 'Interview round', daysAway: 1 },
      { type: 'deadline', label: 'Application deadline', daysAway: 3 },
      { type: 'test', label: 'Online assessment', daysAway: 6 },
    ],
  });

  greeting = this.computeGreeting();
  firstName = computed(() => (this.auth.user()?.fullName ?? this.student().fullName).split(' ')[0]);

  // All counts computed procedurally from the student object
  applicationsInProgress = computed(() => this.student().applications.filter((a) => a.status === 'in_progress').length);
  eligibleRolesCount = computed(() => this.student().eligibleRoles);
  upcomingEventsCount = computed(() => this.student().events.length);

  profileCompleteness = computed(() => {
    const vals = Object.values(this.student().profileFields);
    return Math.round((vals.filter(Boolean).length / vals.length) * 100);
  });

  readonly ringCircumference = 2 * Math.PI * 52;
  ringDashoffset = computed(() => this.ringCircumference * (1 - this.profileCompleteness() / 100));

  summaryCards = computed(() => [
    { label: 'Applications in progress', value: this.applicationsInProgress(), icon: 'clipboard', hint: 'In your tracker', link: '/student/tracker' },
    { label: 'Eligible roles', value: this.eligibleRolesCount(), icon: 'briefcase', hint: 'Matching your profile', link: '/student/jobs' },
    { label: 'Upcoming events', value: this.upcomingEventsCount(), icon: 'calendar', hint: 'Interviews & deadlines', link: '/student/tracker' },
  ]);

  readonly quickActions = [
    { label: 'Browse jobs', desc: 'Find roles you’re eligible for', icon: 'briefcase', link: '/student/jobs' },
    { label: 'View tracker', desc: 'Track your applications', icon: 'clipboard', link: '/student/tracker' },
    { label: 'Complete profile', desc: 'Boost your visibility', icon: 'user', link: '/student/profile' },
  ];

  constructor() {
    // Verify the session and pull the authoritative name from the API (JWT-protected).
    this.studentService.getMe().subscribe({
      next: (me) => this.student.update((s) => ({ ...s, fullName: me.fullName })),
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