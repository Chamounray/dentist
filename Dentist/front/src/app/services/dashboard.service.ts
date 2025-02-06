import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Appointment } from '../interfaces/appointment.interface';
import { Analytics } from '../interfaces/analytics.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<ApiResponse<Analytics>> {
    return forkJoin({
      report: this.http.get<ApiResponse<any>>(`${this.API_URL}/analytics/report`),
      demographics: this.http.get<ApiResponse<any>>(`${this.API_URL}/analytics/demographics`),
      treatmentSuccess: this.http.get<ApiResponse<any>>(`${this.API_URL}/analytics/treatment-success`)
    }).pipe(
      map(responses => ({
        success: true,
        data: {
          ...responses.report.data,
          demographics: responses.demographics.data,
          treatmentSuccess: responses.treatmentSuccess.data
        }
      }))
    );
  }

  getAppointmentsOverTime(period: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/analytics/report?type=${period}`);
  }

  getDemographics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/analytics/demographics`);
  }

  getTreatmentSuccess(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/analytics/treatment-success`);
  }
  getAllAppointments(): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.API_URL}/appointments`);
  }
 

  getRecentAppointments(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/appointments/recent`);
  }
  
  getUpcomingAppointments(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/appointments/upcoming`);
  }
}
