import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSnackBarModule,
    MatMenuModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary" class="px-4">
      <span routerLink="/" class="cursor-pointer">Sonic June</span>
      <span class="flex-1"></span>
      <ng-container *ngIf="authService.user$ | async as user; else loginButton">
        <button mat-button routerLink="/dashboard">
          <mat-icon class="mr-1">dashboard</mat-icon>
          Dashboard
        </button>
        <button mat-button routerLink="/admin" *ngIf="isAdmin">
          <mat-icon class="mr-1">admin_panel_settings</mat-icon>
          Admin
        </button>
        
        <!-- User menu -->
        <button mat-button [matMenuTriggerFor]="menu">
          <mat-icon class="mr-1">account_circle</mat-icon>
          {{ user.email }}
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <a mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </a>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </ng-container>
      <ng-template #loginButton>
        <button mat-button routerLink="/login">Login</button>
      </ng-template>
    </mat-toolbar>
  `
})
export class HeaderComponent implements OnInit {
  isAdmin = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    try {
      // Check admin status when component initializes and when user changes
      this.authService.user$.subscribe(async user => {
        if (user) {
          this.isAdmin = await this.authService.isAdmin();
        } else {
          this.isAdmin = false;
        }
      });
    } catch (error) {
      console.error('Error checking admin status:', error);
      this.isAdmin = false;
    }
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/']);
      this.snackBar.open('Logged out successfully', 'Close', {
        duration: 3000
      });
    } catch (error) {
      console.error('Logout error:', error);
      this.snackBar.open('Error logging out', 'Close', {
        duration: 3000
      });
    }
  }
}