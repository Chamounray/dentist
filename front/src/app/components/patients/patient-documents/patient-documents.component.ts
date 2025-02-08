import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientsService } from '../../../services/patients.service';
import { UploadDocumentDialogComponent } from './upload-document-dialog/upload-document-dialog.component';

@Component({
  selector: 'app-patient-documents',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './patient-documents.component.html',
  styleUrls: ['./patient-documents.component.scss']
})
export class PatientDocumentsComponent implements OnInit {
  @Input() patientId!: string;
  documents: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private patientsService: PatientsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    console.log('Loading documents for patient:', this.patientId);
    
    this.patientsService.getDocuments(this.patientId).subscribe({
      next: (response) => {
        console.log('Documents response:', response);
        this.documents = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.error = 'Failed to load documents';
        this.loading = false;
      }
    });
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      width: '500px',
      data: { patientId: this.patientId }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
      if (result) {
        this.loadDocuments();
      }
    });
  }

  confirmDelete(documentId: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '300px';
    dialogConfig.data = {
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document?'
    };
    
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteDocument(documentId);
      }
    });
  }

  deleteDocument(documentId: string): void {
    this.patientsService.deleteDocument(this.patientId, documentId).subscribe({
      next: () => {
        this.snackBar.open('Document deleted successfully', 'Close', { duration: 3000 });
        this.loadDocuments();
      },
      error: (error) => {
        this.snackBar.open('Failed to delete document', 'Close', { duration: 3000 });
        console.error('Error deleting document:', error);
      }
    });
  }

  getFileIcon(fileUrl: string): string {
    const ext = fileUrl.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'image';
      default: return 'insert_drive_file';
    }
  }
}

// Add this component for the delete confirmation dialog
@Component({
  selector: 'delete-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>{{data.title}}</h2>
    <mat-dialog-content>
      {{data.message}}
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ]
})
export class DeleteConfirmationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {title: string; message: string}) {}
}