import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PatientsService } from '../../../../services/patients.service';

@Component({
  selector: 'app-add-medical-condition-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './add-medical-condition-dialog.component.html',
  styleUrls: ['./add-medical-condition-dialog.component.scss']
})
export class AddMedicalConditionDialogComponent {
  conditionForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddMedicalConditionDialogComponent>,
    private patientsService: PatientsService,
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {
    this.conditionForm = this.fb.group({
      condition: ['', Validators.required],
      diagnosedDate: ['', Validators.required],
      notes: [''],
      status: ['active']
    });
  }

  onSubmit(): void {
    if (this.conditionForm.valid) {
      this.loading = true;
      this.patientsService.addMedicalCondition(
        this.data.patientId,
        this.conditionForm.value
      ).subscribe({
        next: (response) => {
          this.dialogRef.close(response.data);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error adding medical condition:', error);
          this.loading = false;
        }
      });
    }
  }
}