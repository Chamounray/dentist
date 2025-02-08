import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientsService } from '../../../../services/patients.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-upload-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatProgressBarModule
  ],
  templateUrl: './upload-document-dialog.component.html',
  styleUrls: ['./upload-document-dialog.component.scss']
})
export class UploadDocumentDialogComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  uploadProgress = 0;

  
  documentTypes = [
    'X-Ray',
    'Blood Work',
    'Prescription',
    'Treatment Plan',
    'Insurance',
    'Other'
  ];


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UploadDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string },
    private patientsService: PatientsService,
    private snackBar: MatSnackBar
  ) {
    this.uploadForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Invalid file type. Please select an image, PDF, or Word document.', 'Close', { duration: 3000 });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File is too large. Maximum size is 5MB.', 'Close', { duration: 3000 });
        return;
      }

      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      this.loading = true;
      this.uploadProgress = 0;

      const formData = new FormData();
      
      // Important: append file first with explicit filename
      formData.append('file', this.selectedFile, this.selectedFile.name);
      
      // Get form values safely
      const type = this.uploadForm.get('type')?.value;
      const title = this.uploadForm.get('title')?.value;
      const notes = this.uploadForm.get('notes')?.value;

      formData.append('type', type || '');
      formData.append('title', title || '');
      formData.append('notes', notes || '');

      // Debug log
      console.log('Selected file:', this.selectedFile);
      console.log('FormData entries:');
      formData.forEach((value, key) => {
        console.log(key, value);
      });

      this.patientsService.uploadDocument(this.data.patientId, formData)
        .subscribe({
          next: (event: any) => {
            if (event.status === 'progress') {
              this.uploadProgress = event.percentage;
            } else if (event.status === 'completed') {
              this.snackBar.open('Document uploaded successfully', 'Close', { duration: 3000 });
              this.dialogRef.close(true);
            }
          },
          error: (error) => {
            console.error('Upload error:', error);
            console.error('Error details:', error.error);
            this.snackBar.open(
              error.error?.message || 'Failed to upload document', 
              'Close', 
              { duration: 3000 }
            );
            this.loading = false;
            this.uploadProgress = 0;
          }
        });
    }
  }
}

