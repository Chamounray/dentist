import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Patient } from '../../../interfaces/patient.interface';
import { PatientsService } from '../../../services/patients.service';
import { PatientRegistrationDialogComponent } from '../patient-registration-dialog/patient-registration-dialog.component';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSpinner,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'email',
    'phoneNumber',
    'gender',
    'dateOfBirth',
    'lastVisit',
    'actions'
  ];
  dataSource: MatTableDataSource<Patient>;
  loading = true;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private patientsService: PatientsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Patient>([]);
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: Patient, property: string) => {
      switch(property) {
        case 'name':
          return `${item.user.firstName} ${item.user.lastName}`;
        case 'email':
          return item.user.email;
        case 'phoneNumber':
          return item.user.phoneNumber;
        default:
          return (item as any)[property];
      }
    };
  }

  loadPatients(): void {
    this.loading = true;
    this.patientsService.getPatients().subscribe({
      next: (response) => {
        this.dataSource.data = response.data || [];
        this.loading = false;
        console.log(response);
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.snackBar.open('Error loading patients', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openRegistrationDialog(): void {
    const dialogRef = this.dialog.open(PatientRegistrationDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPatients();
        this.snackBar.open('Patient registered successfully', 'Close', { duration: 3000 });
      }
    });
  }

  getAge(dateOfBirth: Date): number {
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  }

  getLastVisit(patient: Patient): string {
    // TODO: Implement last visit logic based on appointments
    return 'Not available';
  }

  formatName(patient: Patient): string {
    return `${patient.user.firstName} ${patient.user.lastName}`;
  }
}