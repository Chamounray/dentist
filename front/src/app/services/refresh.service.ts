import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  private teethRefresh = new BehaviorSubject<boolean>(false);
  private documentsRefresh = new BehaviorSubject<boolean>(false);
  private appointmentsRefresh = new BehaviorSubject<boolean>(false);
  private treatmentPlansRefresh = new BehaviorSubject<boolean>(false);
  private medicalHistoryRefresh = new BehaviorSubject<boolean>(false);
  private overviewRefresh = new BehaviorSubject<boolean>(false);

  teethRefresh$ = this.teethRefresh.asObservable();
  documentsRefresh$ = this.documentsRefresh.asObservable();
  appointmentsRefresh$ = this.appointmentsRefresh.asObservable();
  treatmentPlansRefresh$ = this.treatmentPlansRefresh.asObservable();
  medicalHistoryRefresh$ = this.medicalHistoryRefresh.asObservable();
  overviewRefresh$ = this.overviewRefresh.asObservable();

  refreshTeeth() {
    this.teethRefresh.next(true);
  }

  refreshDocuments() {
    this.documentsRefresh.next(true);
  }

  refreshAppointments() {
    this.appointmentsRefresh.next(true);
  }

  refreshTreatmentPlans() {
    this.treatmentPlansRefresh.next(true);
  }

  refreshMedicalHistory() {
    this.medicalHistoryRefresh.next(true);
  }

  refreshOverview() {
    this.overviewRefresh.next(true);
  }

  // Helper method to refresh all lists
  refreshAll() {
    this.refreshTeeth();
    this.refreshDocuments();
    this.refreshAppointments();
    this.refreshTreatmentPlans();
    this.refreshMedicalHistory();
    this.refreshOverview();
  }
}
