export type UserRole = 'STUDENT' | 'ADMIN';

export interface AuthUser {
  username: string;
  role: UserRole;
  fullName: string;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}