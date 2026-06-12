import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AdminMe {
  username: string;
  fullName: string;
  role: 'STUDENT' | 'ADMIN';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly API = '/api/admin';

  getMe(): Observable<AdminMe> {
    return this.http.get<ApiResponse<AdminMe>>(`${this.API}/me`).pipe(map((r) => r.data));
  }
}