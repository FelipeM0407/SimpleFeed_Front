import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FormDashboard } from '../models/FormDashboard';
import { FieldTypes } from '../models/FieldTypes';
import { FormsTemplates } from '../models/FormsTemplates';
import { FormStructure } from '../models/FormStructure';

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

  getFormFieldsByClientId(clientId: string): Observable<FieldTypes[]> {
    return this.http.get<FieldTypes[]>(`${this.apiUrl}/fieldtypes/${clientId}`);
  }

  getTemplatesByClientId(clientId: string): Observable<FormsTemplates[]> {
    return this.http.get<FormsTemplates[]>(`${this.apiUrl}/templates/${clientId}/templates`);
  }

  createForm(form: FormStructure): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/forms`, form);
  }
  
}
