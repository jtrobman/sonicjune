import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    MatToolbarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header></app-header>
      <main class="container mx-auto px-4 py-8 flex-grow">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        console.log('User session restored');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.snackBar.open('Error connecting to the server', 'Close', {
        duration: 3000
      });
    }
  }
}