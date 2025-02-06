import { Component, Input, OnInit } from '@angular/core';
import { Appointment } from '../../../interfaces/appointment.interface';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppointmentsService } from '../../../services/appointments.service';
import { PatientsService } from '../../../services/patients.service';


/**  
 * Extend the Appointment interface to include a property
 * for display purposes.
 */
interface AppointmentDisplay extends Appointment {
  patientName?: string;
}

@Component({
  selector: 'app-dentist-appointments',
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
  templateUrl: './dentist-appointments.component.html',
  styleUrls: ['./dentist-appointments.component.scss']
})
export class DentistAppointmentsComponent implements OnInit {
  @Input() patientId!: string;
  appointments: AppointmentDisplay[] = [];
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
    private patientService: PatientsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {  
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentsService.getAllAppointments().subscribe({
      next: (response) => {
        // Assign response.data to our appointments array.
        this.appointments = response.data || [];
        // For each appointment, fetch the corresponding patient data.
        this.appointments.forEach(appointment => {
          this.patientService.getPatient(appointment.patient).subscribe({
            next: (patientResponse) => {
              appointment.patientName =
                `${patientResponse.data?.user?.firstName} ${patientResponse.data?.user?.lastName}`;
            },
            error: (error) => {
              console.error(`Error fetching patient for appointment ${appointment._id}:`, error);
              appointment.patientName = 'Unknown';
            }
          });
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.snackBar.open('Error loading appointments', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  updateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'): void {
    this.appointmentsService.updateAppointmentStatus(appointmentId, status).subscribe({
      next: () => {
        this.loadAppointments();
        this.snackBar.open('Appointment status updated', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        this.snackBar.open('Error updating appointment status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteAppointment(appointmentId: string): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointmentsService.deleteAppointment(appointmentId).subscribe({
        next: () => {
          this.loadAppointments();
          this.snackBar.open('Appointment deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting appointment:', error);
          this.snackBar.open('Error deleting appointment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      scheduled: 'primary',
      completed: 'accent',
      cancelled: 'warn',
      'no-show': 'warn'
    };
    return colors[status] || 'primary';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatTime(time: string): string {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
