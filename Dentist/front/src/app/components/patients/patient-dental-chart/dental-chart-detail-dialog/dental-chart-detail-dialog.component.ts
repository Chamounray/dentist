import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipOption } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TreatmentPlansService } from '../../../../services/treatment-plan.service';
import { TreatmentPlan, TreatmentProcedure } from '../../../../interfaces/treatment-plan.interface';
import { MatDialog } from '@angular/material/dialog';
import { AddTreatmentPlanDialogComponent } from '../../patient-treatment-plans/add-treatment-plan-dialog/add-treatment-plan-dialog.component';

interface ToothCondition {
  name: string;
  color: string;
  code: string;
  estimatedCost: number;
}

@Component({
  selector: 'app-tooth-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './dental-chart-detail-dialog.component.html',
  styleUrls: ['./dental-chart-detail-dialog.component.scss']
})
export class DentalChartDetailDialogComponent {
  conditions: ToothCondition[] = [
    { name: 'Healthy', color: '#ffffff', code: 'healthy', estimatedCost: 0 },
    { name: 'Cavity', color: '#ff0000', code: 'cavity', estimatedCost: 150 },
    { name: 'Filling', color: '#808080', code: 'filling', estimatedCost: 200 },
    { name: 'Crown', color: '#ffd700', code: 'crown', estimatedCost: 1000 },
    { name: 'Root Canal', color: '#800000', code: 'root-canal', estimatedCost: 800 },
    { name: 'Missing', color: '#000000', code: 'missing', estimatedCost: 0 }
  ];

  newTreatment = {
    type: '',
    description: ''
  };

  constructor(
    public dialogRef: MatDialogRef<DentalChartDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tooth: any, patientId: string },
    private dialog: MatDialog,
    private treatmentPlansService: TreatmentPlansService
  ) {}

  updateCondition(condition: ToothCondition) {
    // Update tooth condition locally
    this.data.tooth.condition = condition.code;
    
    // Save tooth condition to backend
    this.treatmentPlansService.updateToothCondition(
      this.data.patientId,
      this.data.tooth.number,
      condition.code
    ).subscribe({
      next: () => {
        // Close the current dialog first
        this.dialogRef.close();
        
        // Only open treatment plan dialog for non-healthy conditions
        if (condition.code !== 'healthy') {
          this.dialog.open(AddTreatmentPlanDialogComponent, {
            width: '800px',
            data: {
              patientId: this.data.patientId,
              prefilledProcedure: {
                name: `${condition.name} Treatment`,
                description: `Treatment for ${condition.name.toLowerCase()} on tooth ${this.data.tooth.number}`,
                tooth: this.data.tooth.number.toString(),
                status: 'pending',
                cost: condition.estimatedCost,
                notes: `Condition marked during dental chart examination`
              }
            }
          });
        }
      },
      error: (error) => console.error('Error saving tooth condition:', error)
    });
  }

  private watchProcedureStatus(planId: string, toothNumber: number) {
    this.treatmentPlansService.getTreatmentPlan(planId).subscribe({
      next: (response) => {
        const plan = response.data;
        const procedure = plan?.procedures.find(p => p.tooth === toothNumber.toString());
        
        if (procedure && procedure.status === 'completed') {
          // Update tooth to healthy when procedure is completed
          this.treatmentPlansService.updateToothCondition(
            this.data.patientId,
            toothNumber,
            'healthy'
          ).subscribe();
        }
      }
    });
  }

  addTreatment() {
    if (!this.newTreatment.type) return;

    const treatment = {
      type: this.newTreatment.type,
      description: this.newTreatment.description,
      date: new Date()
    };

    if (!this.data.tooth.treatments) {
      this.data.tooth.treatments = [];
    }

    this.data.tooth.treatments.push(treatment);
    
    this.newTreatment = {
      type: '',
      description: ''
    };

    this.dialogRef.componentInstance.data = { ...this.data };
  }
}