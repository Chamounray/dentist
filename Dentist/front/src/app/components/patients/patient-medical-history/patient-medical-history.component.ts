import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Patient } from '../../../interfaces/patient.interface';
import { PatientsService } from '../../../services/patients.service';
import { AddMedicalConditionDialogComponent } from './add-medical-condition-dialog/add-medical-condition-dialog.component';
import { AddAllergyDialogComponent } from './add-allergy-dialog/add-allergy-dialog.component';

@Component({
  selector: 'app-patient-medical-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './patient-medical-history.component.html',
  styleUrls: ['./patient-medical-history.component.scss']
})
export class PatientMedicalHistoryComponent implements OnInit {
  @Input() patient!: Patient;

  constructor(
    private dialog: MatDialog,
    private patientsService: PatientsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  openAddConditionDialog(): void {
    const dialogRef = this.dialog.open(AddMedicalConditionDialogComponent, {
      width: '500px',
      data: { patientId: this.patient._id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patient.medicalHistory = result.medicalHistory;
        this.snackBar.open('Medical condition added successfully', 'Close', {
          duration: 3000
        });
      }
    });
  }

  openAddAllergyDialog(): void {
    const dialogRef = this.dialog.open(AddAllergyDialogComponent, {
      width: '500px',
      data: { patientId: this.patient._id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patient.allergies = result.allergies;
        this.snackBar.open('Allergy added successfully', 'Close', {
          duration: 3000
        });
      }
    });
  }

  deleteCondition(conditionId: string): void {
    if (confirm('Are you sure you want to delete this medical condition?')) {
      this.patientsService.deleteMedicalCondition(this.patient._id, conditionId)
        .subscribe({
          next: (response) => {
            this.patient.medicalHistory = response.data?.medicalHistory || [];
            this.snackBar.open('Medical condition deleted successfully', 'Close', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error deleting medical condition:', error);
            this.snackBar.open('Error deleting medical condition', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }

  deleteAllergy(allergyId: string): void {
    if (confirm('Are you sure you want to delete this allergy?')) {
      this.patientsService.deleteAllergy(this.patient._id, allergyId)
        .subscribe({
          next: (response) => {
            this.patient.allergies = response.data?.allergies || [];
            this.snackBar.open('Allergy deleted successfully', 'Close', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error deleting allergy:', error);
            this.snackBar.open('Error deleting allergy', 'Close', {
              duration: 3000
            });
          }
        });
    }
  }

  getSeverityColor(severity: string): string {
    const colors = {
      mild: 'accent',
      moderate: 'warning',
      severe: 'error'
    };
    return colors[severity as keyof typeof colors] || 'primary';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}