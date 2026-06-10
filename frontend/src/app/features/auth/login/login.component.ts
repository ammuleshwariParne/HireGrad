import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ThemeToggleComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  role = signal<UserRole>('STUDENT');
  showPassword = signal(false);
  loading = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });
  
   readonly features = [
    'Real-time application tracking',
    'Auto eligibility checks against your profile',
    'Centralized placement analytics',
  ];
  get f() {
    return this.form.controls;
  }

  setRole(role: UserRole): void {
    this.role.set(role);
    this.errorMsg.set(null);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  submit(): void {
    this.errorMsg.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { username, password } = this.form.getRawValue();

    this.auth.login({ username, password, role: this.role() }).subscribe({
      next: (user) => {
        this.loading.set(false);
        // Role-based redirect
        this.router.navigate([user.role === 'ADMIN' ? '/admin' : '/student']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.message ?? 'Login failed. Please try again.');
      },
    });
  }
}