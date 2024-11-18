import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { DeleteConfirmationDialogComponent } from '../../components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule
  ],
  template: `
    <div class="max-w-2xl mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6">Profile Settings</h1>

      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title>Personal Information</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form #profileForm="ngForm" (ngSubmit)="updateProfile()" class="flex flex-col gap-4 mt-4">
            <mat-form-field>
              <mat-label>First Name</mat-label>
              <input
                matInput
                [(ngModel)]="profile.first_name"
                name="firstName"
                #firstNameInput="ngModel"
              >
            </mat-form-field>

            <mat-form-field>
              <mat-label>Last Name</mat-label>
              <input
                matInput
                [(ngModel)]="profile.last_name"
                name="lastName"
                #lastNameInput="ngModel"
              >
            </mat-form-field>

            <mat-form-field>
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                [(ngModel)]="profile.email"
                name="email"
                required
                email
                #emailInput="ngModel"
              >
              <mat-error *ngIf="emailInput.invalid && emailInput.touched">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!profileForm.form.valid || isProcessing"
            >
              {{ isProcessing ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title>Change Password</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form #passwordForm="ngForm" (ngSubmit)="updatePassword()" class="flex flex-col gap-4 mt-4">
            <mat-form-field>
              <mat-label>Current Password</mat-label>
              <input
                matInput
                type="password"
                [(ngModel)]="currentPassword"
                name="currentPassword"
                required
                #currentPasswordInput="ngModel"
              >
            </mat-form-field>

            <mat-form-field>
              <mat-label>New Password</mat-label>
              <input
                matInput
                type="password"
                [(ngModel)]="newPassword"
                name="newPassword"
                required
                minlength="6"
                #newPasswordInput="ngModel"
              >
              <mat-error *ngIf="newPasswordInput.invalid && newPasswordInput.touched">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!passwordForm.form.valid || isProcessing"
            >
              {{ isProcessing ? 'Updating...' : 'Update Password' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title class="text-red-600">Danger Zone</mat-card-title>
        </mat-card-header>
        
        <mat-card-content class="mt-4">
          <p class="text-gray-600 mb-4">
            Deleting your account will permanently remove all your data, including transcriptions.
            This action cannot be undone.
          </p>

          <button
            mat-raised-button
            color="warn"
            (click)="openDeleteAccountDialog()"
            [disabled]="isProcessing"
          >
            Delete Account
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profile = {
    first_name: '',
    last_name: '',
    email: ''
  };

  currentPassword = '';
  newPassword = '';
  isProcessing = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        const profile = await this.authService.getProfile(user.id);
        this.profile = {
          ...this.profile,
          ...profile,
          email: user.email || ''
        };
      }
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error loading profile', 'Close', {
        duration: 3000
      });
    }
  }

  async updateProfile() {
    if (!this.profile.email) return;

    this.isProcessing = true;
    try {
      await this.authService.updateProfile(this.profile);
      this.snackBar.open('Profile updated successfully', 'Close', {
        duration: 3000
      });
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error updating profile', 'Close', {
        duration: 3000
      });
    } finally {
      this.isProcessing = false;
    }
  }

  async updatePassword() {
    if (!this.currentPassword || !this.newPassword) return;

    this.isProcessing = true;
    try {
      await this.authService.updatePassword(this.currentPassword, this.newPassword);
      this.currentPassword = '';
      this.newPassword = '';
      this.snackBar.open('Password updated successfully', 'Close', {
        duration: 3000
      });
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error updating password', 'Close', {
        duration: 3000
      });
    } finally {
      this.isProcessing = false;
    }
  }

  openDeleteAccountDialog(): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: {
        message: 'Are you sure you want to delete your account? This will permanently remove all your data and cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.deleteAccount();
      }
    });
  }

  private async deleteAccount() {
    this.isProcessing = true;
    try {
      await this.authService.deleteAccount();
      this.router.navigate(['/']);
      this.snackBar.open('Account deleted successfully', 'Close', {
        duration: 3000
      });
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error deleting account', 'Close', {
        duration: 3000
      });
    } finally {
      this.isProcessing = false;
    }
  }
}