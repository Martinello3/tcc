import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const token = auth.token?.() ?? null;
  const user = auth.user?.() ?? null;

  const setHeaders: Record<string, string> = {};
  if (token) setHeaders["Authorization"] = `Bearer ${token}`;
  if (user && typeof (user as any).id === 'number') setHeaders["X-User-Id"] = String((user as any).id);

  const authReq = Object.keys(setHeaders).length > 0
    ? req.clone({ setHeaders })
    : req;

  return next(authReq).pipe(
    catchError((err) => {
      const status = err?.status as number | undefined;
      const hadAuthHeader = !!token;
      const isLoginAttempt = req.url.includes('/api/auth/login');
      if ((status === 401 || status === 403) && hadAuthHeader && !isLoginAttempt) {
        auth.logout();
        toast.warning('Sua sessão expirou. Faça login novamente.', 'Sessão expirada');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};

