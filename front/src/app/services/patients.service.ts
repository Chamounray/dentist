import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Patient } from '../interfaces/patient.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  private readonly API_URL = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  

  getPatients(): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(this.API_URL);
  }

  getPatient(id: string): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.API_URL}/${id}`);
  }

  createPatient(patientData: Partial<Patient>): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(this.API_URL, patientData);
  }

  updatePatient(id: string, patientData: Partial<Patient>): Observable<ApiResponse<Patient>> {
    return this.http.put<ApiResponse<Patient>>(`${this.API_URL}/${id}`, patientData);
  }

  getDocuments(patientId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.API_URL}/${patientId}/documents`
    );
  }

  uploadDocument(patientId: string, formData: FormData): Observable<any> {
    return this.http.post(
      `${this.API_URL}/${patientId}/documents`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
        headers: new HttpHeaders({
          Accept: '*/*'
        })
      }
    ).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const total = event.total || 0;
            const progress = Math.round(100 * event.loaded / total);
            return { status: 'progress', percentage: progress };
          case HttpEventType.Response:
            return { status: 'completed', response: event.body };
          default:
            return { status: 'unknown' };
        }
      })
    );
  }

  deleteDocument(patientId: string, documentId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.API_URL}/${patientId}/documents/${documentId}`
    );
  }

  updateToothRecord(patientId: string, toothNumber: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.API_URL}/${patientId}/teeth/${toothNumber}`, data);
  }

  addMedicalCondition(patientId: string, condition: any): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(
      `${this.API_URL}/${patientId}/medical-history`,
      condition
    );
  }

  updateMedicalCondition(
    patientId: string, 
    conditionId: string, 
    condition: any
  ): Observable<ApiResponse<Patient>> {
    return this.http.put<ApiResponse<Patient>>(
      `${this.API_URL}/${patientId}/medical-history/${conditionId}`,
      condition
    );
  }

  deleteMedicalCondition(
    patientId: string, 
    conditionId: string
  ): Observable<ApiResponse<Patient>> {
    return this.http.delete<ApiResponse<Patient>>(
      `${this.API_URL}/${patientId}/medical-history/${conditionId}`
    );
  }

  addAllergy(patientId: string, allergy: any): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(
      `${this.API_URL}/${patientId}/allergies`,
      allergy
    );
  }

  updateAllergy(
    patientId: string, 
    allergyId: string, 
    allergy: any
  ): Observable<ApiResponse<Patient>> {
    return this.http.put<ApiResponse<Patient>>(
      `${this.API_URL}/${patientId}/allergies/${allergyId}`,
      allergy
    );
  }

  deleteAllergy(
    patientId: string, 
    allergyId: string
  ): Observable<ApiResponse<Patient>> {
    return this.http.delete<ApiResponse<Patient>>(
      `${this.API_URL}/${patientId}/allergies/${allergyId}`
    );
  }
}