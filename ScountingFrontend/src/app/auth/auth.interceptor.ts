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

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err) => {
      const status = err?.status as number | undefined;
      if (status === 401 || status === 403) {
        auth.logout();
        toast.warning('Sua sessão expirou. Faça login novamente.', 'Sessão expirada');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};

