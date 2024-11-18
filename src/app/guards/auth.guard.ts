import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    const user = await firstValueFrom(authService.user$);
    if (user) return true;
    
    router.navigate(['/login']);
    return false;
  } catch (error) {
    console.error('Auth guard error:', error);
    router.navigate(['/login']);
    return false;
  }
};