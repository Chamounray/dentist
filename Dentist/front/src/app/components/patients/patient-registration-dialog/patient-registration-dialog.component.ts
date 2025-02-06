import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientsService } from '../../../services/patients.service';

@Component({
  selector: 'app-patient-registration-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './patient-registration-dialog.component.html',
  styleUrls: ['./patient-registration-dialog.component.scss']
})
export class PatientRegistrationDialogComponent {
  registrationForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PatientRegistrationDialogComponent>,
    private patientsService: PatientsService,
    private snackBar: MatSnackBar
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      bloodGroup: [''],
      emergencyContact: this.fb.group({
        name: ['', [Validators.required]],
        relationship: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required]]
      }),
      medicalHistory: [[]],
      allergies: [[]]
    });
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.loading = true;
      const formData = this.registrationForm.value;
      
      this.patientsService.createPatient(formData).subscribe({
        next: (response) => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error registering patient:', error);
          this.snackBar.open(
            error.error.message || 'Error registering patient',
            'Close',
            { duration: 3000 }
          );
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.registrationForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}