import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentsService } from '../../../../services/appointments.service';
import { DentistAvailabilityService } from '../../../../services/dentist-availability.service';

@Component({
  selector: 'app-add-appointment-dialog',
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
    MatProgressSpinnerModule
  ],
 
  templateUrl: './add-appointment-dialog.component.html',
  styleUrls: ['./add-appointment-dialog.component.scss']
})
export class AddAppointmentDialogComponent implements OnInit {
  appointmentForm: FormGroup;
  loading = false;
  loadingSlots = false;
  availableSlots: { startTime: string; endTime: string }[] = [];
  // List of available dates (stored as numbers, i.e. midnight timestamps)
  availableDates: number[] = [];
  // The currently selected slot (if any)
  selectedSlot: { startTime: string; endTime: string } | null = null;

  readonly appointmentTypes = [
    { value: 'checkup' as const, label: 'Check-up' },
    { value: 'treatment' as const, label: 'Treatment' },
    { value: 'emergency' as const, label: 'Emergency' },
    { value: 'consultation' as const, label: 'Consultation' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddAppointmentDialogComponent>,
    private appointmentsService: AppointmentsService,
    private dentistAvailabilityService: DentistAvailabilityService,
    @Inject(MAT_DIALOG_DATA) public data: { patientId: string }
  ) {
    // The form now includes a date (for appointment), type, notes and a hidden timeSlot (set on slot selection)
    this.appointmentForm = this.fb.group({
      date: ['', Validators.required],
      timeSlot: [null, Validators.required],
      type: ['checkup', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.fetchAvailableDates();
  }

  /**
   * Fetch dentist availability entries and extract distinct dates.
   */
  fetchAvailableDates(): void {
    this.dentistAvailabilityService.getAvailability().subscribe(
      (availabilities: any[]) => {
        // Map each availability entry's date to its midnight timestamp
        const dates = availabilities.map(a => {
          const d = new Date(a.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });
        // Remove duplicates using a Set, then convert back to array.
        this.availableDates = Array.from(new Set(dates));
      },
      (error) => {
        console.error('Error fetching dentist availability', error);
      }
    );
  }

  /**
   * Called when the date selection changes.
   */
  onDateChange(): void {
    const date = this.appointmentForm.get('date')?.value;
    if (date) {
      // Clear any previously selected slot
      this.selectedSlot = null;
      this.appointmentForm.patchValue({ timeSlot: null });
      this.fetchAvailableTimeSlots(date);
    }
  }

  /**
   * Fetch available appointment slots for the selected date.
   */
  fetchAvailableTimeSlots(date: Date): void {
    this.loadingSlots = true;
    const dateString = date.toISOString().split('T')[0];
    this.appointmentsService.getAvailableSlots(dateString).subscribe(
      (response) => {
        this.availableSlots = response.data || [];
        this.loadingSlots = false;

        
        console.log(this.availableDates);
        console.log(this.availableSlots);
      },
      (error) => {
        console.error('Error fetching available time slots', error);
        this.loadingSlots = false;
      }
    );
  }

  /**
   * Called when the patient selects a slot.
   */
  selectSlot(slot: { startTime: string; endTime: string }): void {
    this.selectedSlot = slot;
    this.appointmentForm.patchValue({ timeSlot: slot });
  }

  /**
   * Submit the appointment booking.
   */
  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.loading = true;
      const formValue = this.appointmentForm.value;
      const appointmentData = {
        patient: this.data.patientId,
        date: formValue.date,
        startTime: formValue.timeSlot.startTime,
        endTime: formValue.timeSlot.endTime,
        type: formValue.type,
        notes: formValue.notes
      };

      this.appointmentsService.createAppointment(appointmentData).subscribe(
        (response) => {
          this.dialogRef.close(true);
          this.loading = false;
        },
        (error) => {
          console.error('Error creating appointment', error);
          this.loading = false;
        }
      );
    }
  }

  /**
   * Format time strings for display.
   */
  formatTime(time: string): string {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Filter function for the datepicker.
   * Only dates that are (a) not in the past and (b) present in the availableDates list are allowed.
   */
  filterAvailableDates = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Disallow past dates.
    if (date < today) return false;
    // Normalize the date to midnight for comparison.
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Check if the date is in the availableDates list.
    return this.availableDates.includes(d.getTime());
  };
}
