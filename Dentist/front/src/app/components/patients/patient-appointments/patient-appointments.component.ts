import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Appointment } from '../../../interfaces/appointment.interface';
import { AppointmentsService } from '../../../services/appointments.service';
import { AddAppointmentDialogComponent } from './add-appointment-dialog/add-appointment-dialog.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.scss']
})
export class PatientAppointmentsComponent implements OnInit {
  @Input() patientId!: string;
  appointments: Appointment[] = [];
  loading = true;

  readonly appointmentStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'] as const;

  readonly statusIcons = {
    scheduled: 'schedule',
    completed: 'check_circle',
    cancelled: 'cancel',
    'no-show': 'person_off'
  } as const;

  readonly appointmentTypeIcons = {
    checkup: 'health_and_safety',
    treatment: 'medical_services',
    emergency: 'emergency',
    consultation: 'event'
  } as const;

  constructor(
    private dialog: MatDialog,
    private appointmentsService: AppointmentsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentsService.getPatientAppointments(this.patientId).subscribe({
      next: (response) => {
        this.appointments = this.sortAppointments(response.data ?? []);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.snackBar.open('Error loading appointments', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  openAddAppointmentDialog(): void {
    const dialogRef = this.dialog.open(AddAppointmentDialogComponent, {
      width: '600px',
      data: { patientId: this.patientId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
        this.snackBar.open('Appointment scheduled successfully', 'Close', {
          duration: 3000
        });
      }
    });
  }

  updateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'): void {
    this.appointmentsService.updateAppointmentStatus(appointmentId, status).subscribe({
      next: () => {
        this.loadAppointments();
        this.snackBar.open('Appointment status updated', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        this.snackBar.open('Error updating appointment status', 'Close', {
          duration: 3000
        });
      }
    });
  }

  deleteAppointment(appointmentId: string): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointmentsService.deleteAppointment(appointmentId).subscribe({
        next: () => {
          this.loadAppointments();
          this.snackBar.open('Appointment deleted successfully', 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Error deleting appointment:', error);
          this.snackBar.open('Error deleting appointment', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    const colors = {
      scheduled: 'primary',
      completed: 'accent',
      cancelled: 'warn',
      'no-show': 'warn'
    };
    return colors[status as keyof typeof colors] || 'primary';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatTime(time: string): string {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTypeIcon(type: Appointment['type']): string {
    return this.appointmentTypeIcons[type];
  }

  getStatusIcon(status: Appointment['status']): string {
    return this.statusIcons[status];
  }

  sortAppointments(appointments: Appointment[]): Appointment[] {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }
}