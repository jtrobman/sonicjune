import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranscriptionService } from '../../services/transcription.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { DeleteConfirmationDialogComponent } from '../../components/delete-confirmation-dialog/delete-confirmation-dialog.component';

interface Transcription {
  id: string;
  created_at: string;
  text_content: string;
  audio_path: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="max-w-4xl mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Your Transcriptions</h1>
        
        <div>
          <input
            type="file"
            accept="audio/*"
            (change)="onFileSelected($event)"
            class="hidden"
            #fileInput
          >
          <button
            mat-raised-button
            color="primary"
            (click)="fileInput.click()"
            [disabled]="isProcessing"
          >
            <span *ngIf="!isProcessing">Upload New Audio</span>
            <span *ngIf="isProcessing">Processing...</span>
          </button>
        </div>
      </div>

      <mat-progress-bar
        *ngIf="isProcessing"
        mode="indeterminate"
        class="mb-4"
      ></mat-progress-bar>

      <div class="grid gap-4">
        <p *ngIf="transcriptions.length === 0" class="text-center text-gray-500 py-8">
          No transcriptions yet. Upload an audio file to get started!
        </p>

        <mat-card *ngFor="let item of transcriptions">
          <mat-card-header>
            <mat-card-title>{{ item.created_at | date:'medium' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-4">
            <p class="whitespace-pre-wrap text-gray-700">{{ item.text_content }}</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button 
              mat-button 
              color="warn" 
              (click)="openDeleteDialog(item.id)"
              [disabled]="isProcessing"
            >
              <mat-icon class="mr-1">delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  transcriptions: Transcription[] = [];
  isProcessing = false;

  constructor(
    private transcriptionService: TranscriptionService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.loadTranscriptions();
  }

  async loadTranscriptions() {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;

    try {
      this.transcriptions = await this.transcriptionService.getUserTranscriptions(user.id);
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error loading transcriptions', 'Close', {
        duration: 5000
      });
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;

    this.isProcessing = true;

    try {
      // Upload the file
      const uploadResult = await this.transcriptionService.uploadAudio(file, user.id);
      if (!uploadResult?.path) throw new Error('Upload failed');

      // Transcribe the audio
      const transcription = await this.transcriptionService.transcribeAudio(file);

      // Save the transcription
      await this.transcriptionService.saveTranscription(user.id, uploadResult.path, transcription);
      
      // Reload the list
      await this.loadTranscriptions();
      
      this.snackBar.open('Audio transcribed successfully!', 'Close', {
        duration: 3000
      });
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error processing audio file', 'Close', {
        duration: 5000
      });
    } finally {
      this.isProcessing = false;
      input.value = ''; // Reset the file input
    }
  }

  openDeleteDialog(id: string): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: {
        message: 'Are you sure you want to delete this transcription? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.deleteTranscription(id);
      }
    });
  }

  private async deleteTranscription(id: string) {
    try {
      await this.transcriptionService.deleteTranscription(id);
      await this.loadTranscriptions();
      this.snackBar.open('Transcription deleted', 'Close', {
        duration: 3000
      });
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error deleting transcription', 'Close', {
        duration: 5000
      });
    }
  }
}