import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <div class="max-w-4xl mx-auto text-center py-12">
      <p class="text-xl mb-8">Convert your audio files to text using AI-powered transcription</p>
      
      <ng-container *ngIf="authService.user$ | async; else loginPrompt">
        <button mat-raised-button color="primary" routerLink="/dashboard">
          Go to Dashboard
        </button>
      </ng-container>
      
      <ng-template #loginPrompt>
        <button mat-raised-button color="primary" routerLink="/login">
          Get Started
        </button>
      </ng-template>
    </div>
  `
})
export class HomeComponent {
  constructor(public authService: AuthService) {}
}