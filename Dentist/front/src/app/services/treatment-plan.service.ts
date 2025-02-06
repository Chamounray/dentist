import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../interfaces/api-response.interface';
import { TreatmentPlan } from '../interfaces/treatment-plan.interface';

@Injectable({
  providedIn: 'root'
})
export class TreatmentPlansService {
  private API_URL = `${environment.apiUrl}/treatment-plans`;
  private DENTAL_URL = `${environment.apiUrl}/dental-records`;

  constructor(private http: HttpClient) {}
  getAllTreatmentPlans(): Observable<ApiResponse<TreatmentPlan[]>> {
    return this.http.get<ApiResponse<TreatmentPlan[]>>(`${this.API_URL}/all`);
  }

  getTreatmentPlans(patientId: string): Observable<ApiResponse<TreatmentPlan[]>> {
    return this.http.get<ApiResponse<TreatmentPlan[]>>(`${this.API_URL}/patient/${patientId}`);
  }
  

  getTreatmentPlan(id: string): Observable<ApiResponse<TreatmentPlan>> {
    return this.http.get<ApiResponse<TreatmentPlan>>(`${this.API_URL}/${id}`);
  }

  createTreatmentPlan(patientId: string, plan: Partial<TreatmentPlan>): Observable<ApiResponse<TreatmentPlan>> {
    return this.http.post<ApiResponse<TreatmentPlan>>(`${this.API_URL}/patient/${patientId}`, plan);
  }

  updateTreatmentPlan(id: string, plan: Partial<TreatmentPlan>): Observable<ApiResponse<TreatmentPlan>> {
    return this.http.put<ApiResponse<TreatmentPlan>>(`${this.API_URL}/${id}`, plan);
  }

  deleteTreatmentPlan(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  updateProcedureStatus(
    planId: string,
    procedureId: string,
    status: 'pending' | 'completed' | 'cancelled'
  ): Observable<ApiResponse<TreatmentPlan>> {
    return this.http.patch<ApiResponse<TreatmentPlan>>(
      `${this.API_URL}/${planId}/procedures/${procedureId}/status`,
      { status }
    );
  }

  // New methods for dental chart
  getPatientTeeth(patientId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.DENTAL_URL}/patient/${patientId}`);
  }

  updateToothCondition(
    patientId: string,
    toothNumber: number,
    condition: string
  ): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.DENTAL_URL}/patient/${patientId}/tooth/${toothNumber}`,
      { condition }
    );
  }

  getToothHistory(
    patientId: string,
    toothNumber: number
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.DENTAL_URL}/patient/${patientId}/tooth/${toothNumber}/history`
    );
  }

  getPatientTeethConditions(patientId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.DENTAL_URL}/patient/${patientId}/teeth`);
  }
}