import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-role-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Change User Role</h2>
      <p class="text-gray-600 mb-6">{{ data.message }}</p>
      
      <div class="flex justify-end gap-4">
        <button mat-button (click)="onCancel()">
          Cancel
        </button>
        <button mat-raised-button color="primary" (click)="onConfirm()">
          Change Role
        </button>
      </div>
    </div>
  `
})
export class RoleConfirmationDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    private dialogRef: MatDialogRef<RoleConfirmationDialogComponent>
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}