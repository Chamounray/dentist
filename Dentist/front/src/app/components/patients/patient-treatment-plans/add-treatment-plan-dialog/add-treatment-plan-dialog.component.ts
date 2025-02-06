import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TreatmentPlansService } from '../../../../services/treatment-plan.service';

@Component({
  selector: 'app-add-treatment-plan-dialog',
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
    MatNativeDateModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './add-treatment-plan-dialog.component.html',
  styleUrls: ['./add-treatment-plan-dialog.component.scss']
})
export class AddTreatmentPlanDialogComponent {
  planForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTreatmentPlanDialogComponent>,
    private treatmentPlansService: TreatmentPlansService,
    @Inject(MAT_DIALOG_DATA) public data: { 
      patientId: string;
      prefilledProcedure?: {
        name: string;
        description: string;
        tooth: string;
        status: 'pending';
        cost: number;
        notes: string;
      }
    }
  ) {
    this.planForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      startDate: [new Date(), Validators.required],
      endDate: [''],
      status: ['active', Validators.required],
      procedures: this.fb.array([])
    });

    // If we have prefilled data, add it as the first procedure
    if (this.data.prefilledProcedure) {
      this.addProcedure(this.data.prefilledProcedure);
    } else {
      this.addProcedure();
    }
  }

  get procedures() {
    return this.planForm.get('procedures') as FormArray;
  }

  addProcedure(prefilledData?: any) {
    const procedureForm = this.fb.group({
      name: [prefilledData?.name || '', Validators.required],
      description: [prefilledData?.description || ''],
      tooth: [prefilledData?.tooth || ''],
      status: [prefilledData?.status || 'pending', Validators.required],
      cost: [prefilledData?.cost || 0, [Validators.required, Validators.min(0)]],
      notes: [prefilledData?.notes || '']
    });

    this.procedures.push(procedureForm);
  }

  removeProcedure(index: number) {
    this.procedures.removeAt(index);
  }

  calculateTotalCost(): number {
    return this.procedures.controls.reduce((total, control) => {
      return total + (control.get('cost')?.value || 0);
    }, 0);
  }

  onSubmit() {
    if (this.planForm.valid) {
      this.loading = true;
      const planData = {
        ...this.planForm.value,
        totalCost: this.calculateTotalCost()
      };

      this.treatmentPlansService.createTreatmentPlan(this.data.patientId, planData)
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response.data);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error creating treatment plan:', error);
            this.loading = false;
          }
        });
    }
  }
}