import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule, MatTabGroup } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { AdminService } from '../../services/admin.service';
import { TranscriptionService } from '../../services/transcription.service';
import { DeleteConfirmationDialogComponent } from '../../components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { RoleConfirmationDialogComponent } from '../../components/role-confirmation-dialog/role-confirmation-dialog.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    MatTabsModule, 
    MatTableModule, 
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule
  ],
  template: `
    <div class="max-w-6xl mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <mat-tab-group #tabGroup (selectedIndexChange)="onTabChange($event)">
        <mat-tab label="Users">
          <div class="py-4">
            <div *ngIf="isLoading" class="flex justify-center py-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>

            <table *ngIf="!isLoading" mat-table [dataSource]="users" class="w-full">
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef class="!pl-6">Email</th>
                <td mat-cell *matCellDef="let user">{{user.email}}</td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef class="!pl-6">Role</th>
                <td mat-cell *matCellDef="let user">
                  <span [class]="user.role === 'admin' ? 'text-purple-600 font-medium' : ''">
                    {{user.role}}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef class="!pl-6">Created</th>
                <td mat-cell *matCellDef="let user">{{user.created_at | date:'medium'}}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="!pl-6">Actions</th>
                <td mat-cell *matCellDef="let user">
                  <button 
                    mat-button 
                    color="primary"
                    (click)="viewUserTranscriptions(user)"
                    [disabled]="isProcessing"
                  >
                    <mat-icon class="mr-1">list</mat-icon>
                    View Transcriptions
                  </button>
                  <button 
                    mat-button 
                    color="primary"
                    (click)="openRoleDialog(user)"
                    [disabled]="isProcessing"
                  >
                    <mat-icon class="mr-1">swap_horiz</mat-icon>
                    Toggle Role
                  </button>
                  <button 
                    mat-button 
                    color="warn"
                    (click)="openDeleteUserDialog(user)"
                    [disabled]="isProcessing"
                  >
                    <mat-icon class="mr-1">delete</mat-icon>
                    Delete
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['email', 'role', 'created', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['email', 'role', 'created', 'actions'];"></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Transcriptions">
          <div class="py-4">
            <div *ngIf="selectedUser" class="mb-4 flex items-center gap-2">
              <mat-chip-listbox>
                <mat-chip (removed)="clearUserFilter()">
                  Showing transcriptions for {{selectedUser.email}}
                  <button matChipRemove>
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip>
              </mat-chip-listbox>
            </div>

            <div *ngIf="isLoading" class="flex justify-center py-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>

            <table *ngIf="!isLoading" mat-table [dataSource]="filteredTranscriptions" class="w-full">
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef class="!pl-6">User</th>
                <td mat-cell *matCellDef="let item">{{item.profiles.email}}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef class="!pl-6">Date</th>
                <td mat-cell *matCellDef="let item">{{item.created_at | date:'medium'}}</td>
              </ng-container>

              <ng-container matColumnDef="text">
                <th mat-header-cell *matHeaderCellDef class="!pl-6">Transcription</th>
                <td mat-cell *matCellDef="let item" class="whitespace-pre-wrap max-w-[500px] py-4">{{item.text_content}}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="!pl-6">Actions</th>
                <td mat-cell *matCellDef="let item">
                  <button 
                    mat-button 
                    color="warn" 
                    (click)="openDeleteTranscriptionDialog(item)"
                    [disabled]="isProcessing"
                  >
                    <mat-icon class="mr-1">delete</mat-icon>
                    Delete
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['user', 'date', 'text', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['user', 'date', 'text', 'actions'];"></tr>
            </table>

            <p *ngIf="!isLoading && filteredTranscriptions.length === 0" class="text-center text-gray-500 py-8">
              {{ selectedUser ? 'No transcriptions found for this user.' : 'No transcriptions found.' }}
            </p>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .mat-mdc-row .mat-mdc-cell {
      padding: 12px 8px;
    }
    ::ng-deep .mat-mdc-table .mdc-data-table__header-cell {
      padding-left: 8px !important;
    }
  `]
})
export class AdminComponent implements OnInit {
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  
  users: any[] = [];
  transcriptions: any[] = [];
  filteredTranscriptions: any[] = [];
  selectedUser: any = null;
  isLoading = false;
  isProcessing = false;

  constructor(
    private adminService: AdminService,
    private transcriptionService: TranscriptionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      this.users = await this.adminService.getAllUsers();
      this.transcriptions = await this.adminService.getAllTranscriptions();
      this.filteredTranscriptions = this.transcriptions;
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error loading data', 'Close', {
        duration: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }

  onTabChange(index: number) {
    if (index === 1) { // Transcriptions tab
      this.loadData();
    }
  }

  viewUserTranscriptions(user: any) {
    this.selectedUser = user;
    this.filteredTranscriptions = this.transcriptions.filter(t => t.user_id === user.id);
    this.tabGroup.selectedIndex = 1; // Switch to transcriptions tab
  }

  clearUserFilter() {
    this.selectedUser = null;
    this.filteredTranscriptions = this.transcriptions;
  }

  openRoleDialog(user: any) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const dialogRef = this.dialog.open(RoleConfirmationDialogComponent, {
      width: '400px',
      data: {
        message: `Are you sure you want to change ${user.email}'s role to ${newRole}?`
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.updateUserRole(user.id, newRole);
      }
    });
  }

  openDeleteUserDialog(user: any) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: {
        message: `Are you sure you want to delete ${user.email}? This will remove all their data and cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.deleteUser(user.id);
      }
    });
  }

  openDeleteTranscriptionDialog(transcription: any) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: {
        message: 'Are you sure you want to delete this transcription? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.deleteTranscription(transcription.id);
      }
    });
  }

  private async updateUserRole(userId: string, role: string) {
    this.isProcessing = true;
    try {
      await this.adminService.updateUserRole(userId, role);
      await this.loadData();
      this.snackBar.open('User role updated successfully', 'Close', {
        duration: 3000
      });
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error updating user role', 'Close', {
        duration: 5000
      });
    } finally {
      this.isProcessing = false;
    }
  }

  private async deleteUser(userId: string) {
    this.isProcessing = true;
    try {
      await this.adminService.deleteUser(userId);
      await this.loadData();
      this.snackBar.open('User deleted successfully', 'Close', {
        duration: 3000
      });
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error deleting user', 'Close', {
        duration: 5000
      });
    } finally {
      this.isProcessing = false;
    }
  }

  private async deleteTranscription(id: string) {
    this.isProcessing = true;
    try {
      await this.transcriptionService.deleteTranscription(id);
      await this.loadData();
      this.snackBar.open('Transcription deleted successfully', 'Close', {
        duration: 3000
      });
    } catch (error: any) {
      this.snackBar.open(error.message || 'Error deleting transcription', 'Close', {
        duration: 5000
      });
    } finally {
      this.isProcessing = false;
    }
  }
}