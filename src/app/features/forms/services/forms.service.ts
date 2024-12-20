import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FormDashboard } from '../models/FormDashboard';

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Buscar os formulários ativos
  getForms(clientId: number): Observable<FormDashboard[]> {
    return this.http.get<FormDashboard[]>(`${this.apiUrl}/forms/${clientId}`);
  }

  getFormStructure(formId: number): Observable<any> {
    return this.http.get<void>(`${this.apiUrl}/forms/${formId}/structure`);
  }
  
}
