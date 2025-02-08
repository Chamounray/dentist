import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TreatmentPlan } from '../../../interfaces/treatment-plan.interface';
import { TreatmentPlansService } from '../../../services/treatment-plan.service';
import { AddTreatmentPlanDialogComponent } from './add-treatment-plan-dialog/add-treatment-plan-dialog.component';

@Component({
  selector: 'app-patient-treatment-plans',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './patient-treatment-plans.component.html',
  styleUrls: ['./patient-treatment-plans.component.scss']
})
export class PatientTreatmentPlansComponent implements OnInit {
  @Input() patientId!: string;
  treatmentPlans: TreatmentPlan[] = [];
  loading = true;
  
  readonly procedureStatuses = ['completed', 'pending', 'cancelled'] as const;

  constructor(
    private dialog: MatDialog,
    private treatmentPlansService: TreatmentPlansService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTreatmentPlans();
  }

  loadTreatmentPlans(): void {
    this.loading = true;
    this.treatmentPlansService.getTreatmentPlans(this.patientId).subscribe({
      next: (response) => {
        this.treatmentPlans = response.data ?? [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading treatment plans:', error);
        this.snackBar.open('Error loading treatment plans', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  openAddTreatmentPlanDialog(): void {
    const dialogRef = this.dialog.open(AddTreatmentPlanDialogComponent, {
      width: '800px',
      data: { patientId: this.patientId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTreatmentPlans();
        this.snackBar.open('Treatment plan created successfully', 'Close', {
          duration: 3000
        });
      }
    });
  }

  calculateProgress(plan: TreatmentPlan): number {
    if (!plan.procedures.length) return 0;
    const completed = plan.procedures.filter(p => p.status === 'completed').length;
    return (completed / plan.procedures.length) * 100;
  }

  getStatusColor(status: string): string {
    const colors = {
      active: 'primary',
      completed: 'accent',
      cancelled: 'warn'
    };
    return colors[status as keyof typeof colors] || 'primary';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  updateProcedureStatus(
    plan: TreatmentPlan,
    procedureId: string,
    status: 'pending' | 'completed' | 'cancelled'
  ): void {
    this.treatmentPlansService.updateProcedureStatus(plan._id, procedureId, status)
      .subscribe({
        next: (response) => {
          const index = this.treatmentPlans.findIndex(p => p._id === plan._id);
          if (index !== -1) {
            this.treatmentPlans[index] = response.data as TreatmentPlan;
          }
          this.snackBar.open('Procedure status updated', 'Close', {
            duration: 3000
          });

        },
        error: (error) => {
          console.error('Error updating procedure status:', error);
          this.snackBar.open('Error updating procedure status', 'Close', {
            duration: 3000
          });
        }
      });
  }

  deleteTreatmentPlan(planId: string): void {
    if (confirm('Are you sure you want to delete this treatment plan?')) {
      this.treatmentPlansService.deleteTreatmentPlan(planId).subscribe({
        next: () => {
          this.treatmentPlans = this.treatmentPlans.filter(p => p._id !== planId);
          this.snackBar.open('Treatment plan deleted successfully', 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Error deleting treatment plan:', error);
          this.snackBar.open('Error deleting treatment plan', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }
}
