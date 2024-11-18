import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="max-w-md mx-auto p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form #registerForm="ngForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4 mt-4">
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                email
                #emailInput="ngModel"
              >
              <mat-error *ngIf="emailInput.invalid && emailInput.touched">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                minlength="6"
                #passwordInput="ngModel"
              >
              <mat-error *ngIf="passwordInput.invalid && passwordInput.touched">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!registerForm.form.valid || isLoading"
            >
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>

            <p class="text-center mt-4">
              Already have an account?
              <a routerLink="/login" class="text-blue-600 hover:underline">Login</a>
            </p>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    try {
      await this.authService.signUp(this.email, this.password);
      this.snackBar.open('Account created! You can now log in.', 'Close', {
        duration: 5000
      });
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Registration error:', error);
      this.snackBar.open(error.message || 'Error creating account', 'Close', {
        duration: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }
}