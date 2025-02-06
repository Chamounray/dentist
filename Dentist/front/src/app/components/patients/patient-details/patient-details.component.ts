import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Patient } from '../../../interfaces/patient.interface';
import { PatientsService } from '../../../services/patients.service';
import { PatientOverviewComponent } from '../patient-overview/patient-overview.component';
import { PatientMedicalHistoryComponent } from '../patient-medical-history/patient-medical-history.component';
import { PatientTreatmentPlansComponent } from '../patient-treatment-plans/patient-treatment-plans.component';
import { PatientAppointmentsComponent } from '../patient-appointments/patient-appointments.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PatientDocumentsComponent } from '../patient-documents/patient-documents.component';
import { PatientDentalChartComponent } from '../patient-dental-chart/patient-dental-chart.component';


@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PatientOverviewComponent,
    PatientMedicalHistoryComponent,
    PatientTreatmentPlansComponent,
    PatientAppointmentsComponent,
    PatientDocumentsComponent,
    PatientDentalChartComponent
  ],
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss']
})
export class PatientDetailsComponent implements OnInit, OnDestroy {
  patient: Patient | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private patientsService: PatientsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.loadPatientDetails(params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPatientDetails(patientId: string): void {
    this.loading = true;
    this.patientsService.getPatient(patientId).subscribe({
      next: (response) => {
        this.patient = response.data || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patient details:', error);
        this.snackBar.open(
          'Error loading patient details',
          'Close',
          { duration: 3000 }
        );
        this.loading = false;
      }
    });
  }

  getAge(dateOfBirth: Date): number {
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  }

  formatName(patient: Patient): string {
    return `${patient.user.firstName} ${patient.user.lastName}`;
  }
}