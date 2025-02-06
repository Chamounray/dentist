
   import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
  import { MatButtonModule } from '@angular/material/button';
  import { MatCardModule } from '@angular/material/card';
  import { MatFormFieldModule } from '@angular/material/form-field';
  import { MatIconModule } from '@angular/material/icon';
  import { MatInputModule } from '@angular/material/input';
  import { MatDatepickerModule } from '@angular/material/datepicker';
  import { MatNativeDateModule } from '@angular/material/core';
  import { DentistAvailabilityService } from '../../../services/dentist-availability.service';
  
  @Component({
    selector: 'app-dentist-availability',
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatButtonModule,
      MatCardModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatNativeDateModule
    ],
    providers: [
      MatDatepickerModule,
      MatNativeDateModule
    ],
    templateUrl: './dentist-availability.component.html',
    styleUrls: ['./dentist-availability.component.scss']
  })
  export class DentistAvailabilityComponent implements OnInit {
    availabilityForm: FormGroup;
    dentistAvailability: any[] = [];
    editingAvailabilityId: string | null = null;
  
    constructor(
      private formBuilder: FormBuilder,
      private dentistAvailabilityService: DentistAvailabilityService
    ) {
      // The form now includes a date field instead of a day-of-week.
      this.availabilityForm = this.formBuilder.group({
        date: ['', Validators.required],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required]
      });
    }
  
    ngOnInit(): void {
      this.fetchDentistAvailability();
    }
  
    onSubmit(): void {
      if (this.availabilityForm.valid) {
        const formValue = this.availabilityForm.value;
        // The date is taken directly from the datepicker.
        const payload = {
          date: formValue.date.toISOString(),
          startTime: formValue.startTime,
          endTime: formValue.endTime
        };
  
        if (this.editingAvailabilityId) {
          // Update the existing availability entry.
          this.dentistAvailabilityService
            .updateAvailability(this.editingAvailabilityId, payload)
            .subscribe(
              (response) => {
                console.log('Availability updated successfully', response);
                this.fetchDentistAvailability();
                this.resetForm();
              },
              (error) => {
                console.error('Error updating availability', error);
              }
            );
        } else {
          // Create a new availability entry.
          this.dentistAvailabilityService.createAvailability(payload).subscribe(
            (response) => {
              console.log('Availability created successfully', response);
              this.fetchDentistAvailability();
              this.resetForm();
            },
            (error) => {
              console.error('Error creating availability', error);
            }
          );
        }
      }
    }
  
    fetchDentistAvailability(): void {
      this.dentistAvailabilityService.getAvailability().subscribe(
        (response) => {
          // Assuming the service returns an array of availability entries.
          this.dentistAvailability = response;
        },
        (error) => {
          console.error('Error fetching dentist availability', error);
        }
      );
    }
  
    editAvailability(availability: any): void {
      const dateObj = new Date(availability.date);
      this.availabilityForm.patchValue({
        date: dateObj,
        startTime: availability.startTime,
        endTime: availability.endTime
      });
      this.editingAvailabilityId = availability._id;
    }
  
    deleteAvailability(availability: any): void {
      if (confirm('Are you sure you want to delete this availability?')) {
        this.dentistAvailabilityService.deleteAvailability(availability._id).subscribe(
          (response) => {
            console.log('Availability deleted successfully', response);
            this.fetchDentistAvailability();
          },
          (error) => {
            console.error('Error deleting availability', error);
          }
        );
      }
    }
  
    resetForm(): void {
      this.availabilityForm.reset();
      this.editingAvailabilityId = null;
    }
  }
  