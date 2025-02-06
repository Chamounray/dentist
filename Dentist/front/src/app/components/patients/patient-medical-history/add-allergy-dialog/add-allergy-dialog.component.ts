import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PatientsService } from '../../../../services/patients.service';

@Component({
  selector: 'app-add-allergy-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './add-allergy-dialog.component.html',
  styleUrls: ['./add-allergy-dialog.component.scss']
})
export class AddAllergyDialogComponent {
  allergyForm: FormGroup;
  loading = false;
  severityOptions = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddAllergyDialogComponent>,
    private patientsService: PatientsService,
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {
    this.allergyForm = this.fb.group({
      allergen: ['', Validators.required],
      severity: ['', Validators.required],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.allergyForm.valid) {
      this.loading = true;
      this.patientsService.addAllergy(
        this.data.patientId,
        this.allergyForm.value
      ).subscribe({
        next: (response) => {
          this.dialogRef.close(response.data);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error adding allergy:', error);
          this.loading = false;
        }
      });
    }
  }
}