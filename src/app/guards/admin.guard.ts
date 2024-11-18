import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const adminGuard = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);

  try {
    const isAdmin = await authService.isAdmin();
    if (!isAdmin) {
      snackBar.open('Access denied. Admin privileges required.', 'Close', {
        duration: 3000
      });
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Admin guard error:', error);
    router.navigate(['/dashboard']);
    return false;
  }
};