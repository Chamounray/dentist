import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Patient } from '../../../interfaces/patient.interface';
import { PatientsService } from '../../../services/patients.service';
import { DentalChartDetailDialogComponent } from './dental-chart-detail-dialog/dental-chart-detail-dialog.component';
import { MatChip, MatChipsModule } from '@angular/material/chips';
import { TreatmentPlansService } from '../../../services/treatment-plan.service';

interface Tooth {
  number: number;
  condition?: string;
  treatments: {
    type: string;
    date: Date;
    description: string;
  }[];
}

@Component({
  selector: 'app-patient-dental-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatChip,
    MatDialogModule
  ],
  templateUrl: './patient-dental-chart.component.html',
  styleUrls: ['./patient-dental-chart.component.scss']
})
export class PatientDentalChartComponent implements OnInit {
  @Input() patient!: Patient;
  @Input() currentTreatmentPlan?: string;
  
  upperTeeth: Tooth[] = [];
  lowerTeeth: Tooth[] = [];
  selectedTooth: Tooth | null = null;

  conditions = {
    healthy: { name: 'Healthy', color: '#ffffff' },
    cavity: { name: 'Cavity', color: '#ff0000' },
    filling: { name: 'Filling', color: '#808080' },
    missing: { name: 'Missing', color: '#000000' },
    crown: { name: 'Crown', color: '#ffd700' },
    rootCanal: { name: 'Root Canal', color: '#0000ff' }
  };

  toothSvgPath = `
    M 50 10 
    C 30 10, 10 30, 10 50 
    L 10 80 
    C 10 90, 30 100, 50 100 
    C 70 100, 90 90, 90 80 
    L 90 50 
    C 90 30, 70 10, 50 10 
    Z
  `; // Basic tooth shape SVG path

  constructor(
    private dialog: MatDialog,
    private PatientsService: PatientsService,
    private treatmentPlansService: TreatmentPlansService
  ) {}

  ngOnInit() {
    this.initializeTeeth();
    this.loadTeethConditions();
  }

  private initializeTeeth() {
    // Upper right (18-11) and Upper left (21-28)
    this.upperTeeth = [
      ...Array.from({ length: 8 }, (_, i) => ({
        number: 18 - i,  // 18,17,16,15,14,13,12,11
        treatments: []
      })),
      ...Array.from({ length: 8 }, (_, i) => ({
        number: 21 + i,  // 21,22,23,24,25,26,27,28
        treatments: []
      }))
    ];

    // Lower right (48-41) and Lower left (31-38)
    this.lowerTeeth = [
      ...Array.from({ length: 8 }, (_, i) => ({
        number: 48 - i,  // 48,47,46,45,44,43,42,41
        treatments: []
      })),
      ...Array.from({ length: 8 }, (_, i) => ({
        number: 31 + i,  // 31,32,33,34,35,36,37,38
        treatments: []
      }))
    ];
  }

  selectTooth(tooth: Tooth) {
    const dialogRef = this.dialog.open(DentalChartDetailDialogComponent, {
      width: '500px',
      data: { 
        tooth,
        patientId: this.patient._id,
        currentTreatmentPlan: this.currentTreatmentPlan
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the tooth data in your backend
        this.PatientsService.updateToothRecord(this.patient._id, tooth.number, tooth)
          .subscribe({
            next: (response) => {
              console.log('Tooth record updated:', response);
            },
            error: (error) => {
              console.error('Error updating tooth record:', error);
            }
          });
      }
    });
  }

  getToothColor(tooth: Tooth): string {
    return tooth.condition ? this.conditions[tooth.condition as keyof typeof this.conditions].color : '#ffffff';
  }

  loadTeethConditions() {
    this.treatmentPlansService.getPatientTeethConditions(this.patient._id)
      .subscribe({
        next: (response) => {
          if (response.data) {
            // Update teeth conditions in your chart
            response.data.forEach((tooth: any) => {
              const toothElement = this.upperTeeth.find(t => t.number === tooth.number) || this.lowerTeeth.find(t => t.number === tooth.number);
              if (toothElement) {
                toothElement.condition = tooth.condition;
              }
            });
          }
        },
        error: (error) => console.error('Error loading teeth conditions:', error)
      });
  }
}