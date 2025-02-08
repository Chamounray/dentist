import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DentistAvailabilityService {
  private apiUrl = 'http://localhost:5000/api/dentist-availability';

  constructor(private http: HttpClient) {}

  createAvailability(availability: any): Observable<any> {
    return this.http.post(this.apiUrl, availability);
  }

  getAvailability(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateAvailability(availabilityId: string, availability: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${availabilityId}`, availability);
  }

  deleteAvailability(availabilityId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${availabilityId}`);
  }
}
