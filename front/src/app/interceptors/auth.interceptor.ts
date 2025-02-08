import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Skip interceptor for certain URLs (like login/register)
  const isAuthUrl = req.url.includes(`${environment.apiUrl}/auth`);
  if (isAuthUrl && !req.url.includes('validate-token')) {
    return next(req);
  }

  // Add logic to refresh token when access token expires
  if (authService.isTokenExpired() && !req.url.includes('refresh-token')) {
    return authService.refreshAccessToken().pipe(
      switchMap(() => {
        const headers: { [key: string]: string } = {
          Authorization: `Bearer ${authService.getToken()}`
        };
        
        if (!req.body || !(req.body instanceof FormData)) {
          headers['Content-Type'] = 'application/json';
        }

        const newReq = req.clone({
          setHeaders: headers
        });
        return next(newReq);
      }),
      catchError(error => {
        authService.logout();
        return throwError(() => error);
      })
    );
  }

  const token = authService.getToken();
  
  if (token) {
    const headers: { [key: string]: string } = {
      Authorization: `Bearer ${token}`
    };
    
    if (!req.body || !(req.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const clonedReq = req.clone({
      setHeaders: headers
    });

    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          authService.logout();
        } else if (error.status === 403) {
          console.error('Access forbidden:', error.error.message);
        } else if (error.status === 0) {
          console.error('Server unreachable');
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};