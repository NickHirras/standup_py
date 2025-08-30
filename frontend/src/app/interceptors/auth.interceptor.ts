import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  // Only add token to API requests
  if (request.url.includes('/api/')) {
    const token = localStorage.getItem('access_token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }
  
  return next(request);
};
