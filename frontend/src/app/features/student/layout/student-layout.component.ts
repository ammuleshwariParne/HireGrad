import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-student-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LogoComponent, ThemeToggleComponent],
  templateUrl: './student-layout.component.html',
})
export class StudentLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  @ViewChild('userMenu') userMenu?: ElementRef<HTMLElement>;
  @ViewChild('bellMenu') bellMenu?: ElementRef<HTMLElement>;

  readonly user = this.auth.user;
  search = signal('');
  menuOpen = signal(false);
  bellOpen = signal(false);

  // Sidebar nav — navigation only, routes to separate pages.
  readonly navItems = [
    { label: 'Home', path: '/student/home', icon: 'home' },
    { label: 'Job dashboard', path: '/student/jobs', icon: 'briefcase' },
    { label: 'Application tracker', path: '/student/tracker', icon: 'clipboard' },
  ];

  // === MOCK notifications — replace with GET /api/student/notifications ===
  notifications = signal([
    { title: 'Complete your profile', detail: 'Add projects to improve eligibility matches.' },
    { title: 'New eligible roles', detail: 'Roles matching your skills were posted.' },
  ]);
  unreadCount = computed(() => this.notifications().length);

  initials = computed(() => {
    const parts = (this.user()?.fullName ?? '').trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'S';
  });

  toggleMenu() { this.menuOpen.update((v) => !v); this.bellOpen.set(false); }
  toggleBell() { this.bellOpen.update((v) => !v); this.menuOpen.set(false); }

  goProfile() { this.menuOpen.set(false); this.router.navigate(['/student/profile']); }

  logout() {
    this.menuOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goSearch() {
    if (!this.search().trim()) return;
    // Search is applied on the Jobs page (query wiring lands with that feature).
    this.router.navigate(['/student/jobs']);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const t = e.target as Node;
    if (this.menuOpen() && this.userMenu && !this.userMenu.nativeElement.contains(t)) this.menuOpen.set(false);
    if (this.bellOpen() && this.bellMenu && !this.bellMenu.nativeElement.contains(t)) this.bellOpen.set(false);
  }
}