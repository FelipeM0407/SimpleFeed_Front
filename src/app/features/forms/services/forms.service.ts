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
  private frontUrl = `${environment.frontUrl}`;
  formNames: string[] = [];

  constructor(private http: HttpClient) {}

  getFrontUrl(): string {
    return this.frontUrl;
  }

  setFormNames(formNames: string[]){
    this.formNames = formNames;
  }

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

  validateExistenceFeedbacks(formId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/forms/${formId}/feedbacks`);
  }

  saveFormEdits(form: any): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/forms/save-edits`, form);
  }

  deleteForm(formId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/forms/${formId}`);
  }

  duplicateForm(formId: number): Observable<FormStructure> {
    return this.http.post<FormStructure>(`${this.apiUrl}/forms/${formId}/duplicate`, {});
  }

  renameForm(formId: number, name: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forms/${formId}/rename`, { name });
  }
  
  
}
