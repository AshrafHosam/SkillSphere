import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { LoginRequest, LoginResponse, RefreshTokenRequest, ChangePasswordRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getStoredUser());

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser?.accessToken;
  }

  get accessToken(): string | null {
    return this.currentUser?.accessToken ?? null;
  }

  get userRole(): string | null {
    return this.currentUser?.user?.role ?? null;
  }

  get fullName(): string {
    return this.currentUser?.user?.fullName ?? '';
  }

  get profileId(): string | null {
    return this.currentUser?.user?.profileId ?? null;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => {
        localStorage.setItem('user', JSON.stringify(res));
        this.currentUserSubject.next(res);
      })
    );
  }

  refreshToken(): Observable<LoginResponse> {
    const req: RefreshTokenRequest = {
      accessToken: this.currentUser!.accessToken,
      refreshToken: this.currentUser!.refreshToken
    };
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, req).pipe(
      tap(res => {
        localStorage.setItem('user', JSON.stringify(res));
        this.currentUserSubject.next(res);
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, request);
  }

  logout(): void {
    if (this.currentUser) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken: this.currentUser.refreshToken }).subscribe();
    }
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private getStoredUser(): LoginResponse | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }
}
