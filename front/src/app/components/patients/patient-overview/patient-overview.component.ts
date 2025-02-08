import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Patient } from '../../../interfaces/patient.interface';
import { PatientsService } from '../../../services/patients.service';
import { AppointmentsService } from '../../../services/appointments.service';

@Component({
  selector: 'app-patient-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './patient-overview.component.html',
  styleUrls: ['./patient-overview.component.scss']
})
export class PatientOverviewComponent {
  @Input() patient!: Patient;
  appointmentCount: number = 0;
  documentCount: number = 0;

  constructor(
    private patientsService: PatientsService,
    private appointmentsService: AppointmentsService
  ) {}

  ngOnInit() {
    this.loadAppointmentCount();
    this.loadDocumentCount();
  }

  loadAppointmentCount() {
    this.appointmentsService.getPatientAppointments(this.patient._id).subscribe({
      next: (response) => {
        this.appointmentCount = response?.data?.length || 0;
      },
      error: (error) => {
        console.error('Error loading appointment count:', error);
        this.appointmentCount = 0;
      }
    });
  }

  loadDocumentCount() {
    this.patientsService.getDocuments(this.patient._id).subscribe({
      next: (response) => {
        this.documentCount = response?.data?.length || 0;
      },
      error: (error) => {
        console.error('Error loading document count:', error);
        this.documentCount = 0;
      }
    });
  }

  getAge(dateOfBirth: Date): number {
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getAllergySeverityColor(severity: string): string {
    const colors = {
      mild: 'accent',
      moderate: 'warning',
      severe: 'error'
    };
    return colors[severity as keyof typeof colors] || 'primary';
  }
}