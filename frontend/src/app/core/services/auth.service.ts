import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthUser, LoginRequest, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Declared BEFORE `_user` so restore() can safely use them.
  private readonly STORAGE_KEY = 'hiregrad-user';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _user = signal<AuthUser | null>(this.restore());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly role = computed<UserRole | null>(() => this._user()?.role ?? null);

  // --- MOCK credentials (remove once the backend is wired up) ---
  private readonly MOCK_USERS = [
    { username: 'student', password: 'student123', role: 'STUDENT' as UserRole, fullName: 'Aarav Sharma' },
    { username: 'admin', password: 'admin123', role: 'ADMIN' as UserRole, fullName: 'Placement Cell' },
  ];

  login(req: LoginRequest): Observable<AuthUser> {
    /* REPLACE this mock block with the real Spring Boot call:
       return this.http.post<ApiResponse<AuthUser>>('/api/auth/login', req)
         .pipe(map(res => res.data), tap(u => this.persist(u))); */
    const match = this.MOCK_USERS.find(
      (u) => u.username === req.username && u.password === req.password && u.role === req.role
    );

    if (!match) {
      return throwError(() => new Error('Invalid username, password, or selected role.')).pipe(delay(700));
    }

    const user: AuthUser = {
      username: match.username,
      role: match.role,
      fullName: match.fullName,
      token: 'mock-jwt-token',
    };
    return of(user).pipe(delay(700), tap((u) => this.persist(u)));
  }

  logout(): void {
    this._user.set(null);
    if (this.isBrowser) localStorage.removeItem(this.STORAGE_KEY);
  }

  private persist(user: AuthUser): void {
    this._user.set(user);
    if (this.isBrowser) localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  private restore(): AuthUser | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}