import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Appointment } from '../interfaces/appointment.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private readonly API_URL = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getPatientAppointments(patientId: string): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.API_URL}/patient/${patientId}`);
  }

  getAppointment(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.API_URL}/${id}`);
  }
  getAllAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.API_URL}/appointments`);
  }
  

 
  updateAppointment(id: string, appointment: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.API_URL}/${id}`, appointment);
  }

  deleteAppointment(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  updateAppointmentStatus(
    id: string, 
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  ): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(`${this.API_URL}/${id}/status`, { status });
  }

  getAvailableSlots(date: string): Observable<ApiResponse<{ startTime: string; endTime: string }[]>> {
    return this.http.get<ApiResponse<{ startTime: string; endTime: string }[]>>(
      `${this.API_URL}/available-slots`,
      { params: { date } }
    );
  }

  createAppointment(appointment: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.API_URL, appointment);
  }

  getUpcomingAppointments(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.API_URL}/upcoming`);
  }

  getRecentAppointments(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.API_URL}/recent`);
  }
}