import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardService } from '../../services/dashboard.service';
import { Analytics } from '../../interfaces/analytics.interface';
import { Observable, forkJoin } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AppointmentsService } from '../../services/appointments.service';
import { AppointmentTableData } from '../../interfaces/appointment-table.interface';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxChartsModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  analytics: Analytics | null = null;
  loading = true;
  error: string | null = null;

  // Chart data
  appointmentStatusData: any[] = [];
  appointmentsByTypeData: any[] = [];
  treatmentProceduresData: any[] = [];
  monthlyTrendsData: any[] = [];

  // Chart options
  view: [number, number] = [0, 0];
  colorScheme: string = 'cool';
  gradient = false;
  showLegend = true;
  showLabels = true;
  isDoughnut = false;

  displayedColumns: string[] = ['date', 'time', 'patient', 'type', 'status'];
  upcomingAppointments = new MatTableDataSource<AppointmentTableData>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dashboardService: DashboardService,
    private appointmentsService: AppointmentsService
  ) {
    // Make charts responsive
    this.onResize();
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadUpcomingAppointments();
    // Add resize listener
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngAfterViewInit() {
    this.upcomingAppointments.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    // Remove resize listener
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  private onResize(): void {
    const width = window.innerWidth;
    if (width <= 500) {
      this.view = [width - 50, 300];
    } else if (width <= 768) {
      this.view = [width / 2 - 50, 300];
    } else {
      this.view = [width / 2 - 100, 300];
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (response) => {
        console.log('Dashboard response:', response); // Debug log
        if (response.success && response.data) {
          this.analytics = response.data;
          this.prepareChartData();
          this.loading = false;
        } else {
          this.error = 'Failed to load dashboard data';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  private prepareChartData(): void {
    if (!this.analytics) return;

    // Appointment Status Chart
    this.appointmentStatusData = [
      {
        name: 'Completed',
        value: this.analytics.appointmentMetrics?.completed || 0
      },
      {
        name: 'Cancelled',
        value: this.analytics.appointmentMetrics?.cancelled || 0
      },
      {
        name: 'No Show',
        value: this.analytics.appointmentMetrics?.noShow || 0
      },
      {
        name: 'Scheduled',
        value: this.analytics.appointmentMetrics?.scheduled || 0
      }
    ];

    // Update chart options based on screen size
    const width = window.innerWidth;
    if (width < 768) {
      this.showLegend = false;
      this.showLabels = true;
    } else {
      this.showLegend = true;
      this.showLabels = true;
    }

    // Appointments by Type Chart
    if (this.analytics.appointmentsByType) {
      this.appointmentsByTypeData = this.analytics.appointmentsByType.map((item: any) => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.count
      }));
    }

    // Treatment Procedures Chart
    if (this.analytics.treatmentProcedures) {
      this.treatmentProceduresData = this.analytics.treatmentProcedures.map((item: any) => ({
        name: item._id,
        value: item.count,
        avgCost: item.avgCost
      }));
    }

    // Monthly Trends Chart
    if (this.analytics.monthlyAppointments) {
      this.monthlyTrendsData = [{
        name: 'Appointments',
        series: this.analytics.monthlyAppointments.map((item: any) => ({
          name: `${item._id.year}-${item._id.month}`,
          value: item.count
        }))
      }];
    }
  }

  // Format numbers for display
  formatNumber(value: number): string {
    return value?.toLocaleString() || '0';
  }

  // Calculate percentage
  calculatePercentage(value: number, total: number): string {
    return total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }

  loadUpcomingAppointments(): void {
    this.appointmentsService.getUpcomingAppointments().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.upcomingAppointments.data = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading upcoming appointments:', error);
        this.error = 'Failed to load upcoming appointments';
      }
    });
  }
}
