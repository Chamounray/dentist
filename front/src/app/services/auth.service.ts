import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../environments/environment';
import { User } from '../interfaces/user.interface';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private tokenCheckInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.checkToken();
    // Periodically check token validity
    this.tokenCheckInterval = setInterval(() => this.checkToken(), 5 * 60 * 1000); // Every 5 minutes
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials, { withCredentials: true }).pipe(
      tap((response: any) => {
        this.storeTokens(response.accessToken);
        this.scheduleTokenRefresh();
        this.userSubject.next(response.user);
        console.log(response.user);
        this.snackBar.open('Login successful', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.snackBar.open(error.error.message || 'Login failed', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData).pipe(
      tap((response: any) => {
        this.snackBar.open('Registration successful', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        this.snackBar.open(error.error.message || 'Registration failed', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        localStorage.removeItem('accessToken');
        this.userSubject.next(null);
        clearInterval(this.tokenCheckInterval);
        this.router.navigate(['/login']);
        this.snackBar.open('Logged out successfully', 'Close', { duration: 3000 });
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private checkToken(): void {
    const token = this.getToken();
    if (!token) {
      this.handleInvalidToken();
      return;
    }

    // Validate token with backend
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`${this.API_URL}/validate-token`, { headers }).pipe(
      tap((response: any) => {
        this.userSubject.next(response.user);
      }),
      catchError(error => {
        this.handleInvalidToken();
        return throwError(() => error);
      })
    ).subscribe();
  }

  private handleInvalidToken(): void {
    localStorage.removeItem('accessToken');
    this.userSubject.next(null);
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
      this.snackBar.open('Session expired. Please login again.', 'Close', { duration: 3000 });
    }
  }

  

  private storeTokens(accessToken: string) {
    localStorage.setItem('accessToken', accessToken);
  }

  private scheduleTokenRefresh() {
    const token = this.getToken();
    if (!token) return;
    try {
      const decoded: any = jwtDecode(token);
      const expiresInMs = decoded.exp * 1000 - Date.now();
      // Refresh 1 minute before expiry
      const refreshInMs = expiresInMs - 60 * 1000;
      setTimeout(() => this.refreshAccessToken().subscribe(), refreshInMs);
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }
  

 
refreshAccessToken(): Observable<any> {
  return this.http.post(`${this.API_URL}/refresh-token`, {}, { withCredentials: true }).pipe(
    tap((response: any) => {
      console.log('New access token:', response.accessToken);
      this.storeTokens(response.accessToken);
      this.scheduleTokenRefresh();
    }),
    catchError(error => {
      console.error('Error refreshing token:', error);
      this.logout();
      return throwError(() => error);
    })
  );
}
  

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }
}