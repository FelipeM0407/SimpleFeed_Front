import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FormDashboard } from '../models/FormDashboard';
import { FieldTypes } from '../models/FieldTypes';
import { FormsTemplates } from '../models/FormsTemplates';
import { FormStructure } from '../models/FormStructure';
import { FormSettings } from '../models/FormSettings';
import { FormStyleDto } from '../models/FormStyleDto';

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  private apiUrl = `${environment.apiUrl}`;
  private frontUrl = `${environment.frontUrl}`;
  formNames: string[] = [];

  constructor(private http: HttpClient) { }

  getFrontUrl(): string {
    return this.frontUrl;
  }

  setFormNames(formNames: string[]) {
    this.formNames = formNames;
  }

  // Buscar os formulários ativos
  getForms(clientId: number, statusForm: any): Observable<FormDashboard[]> {
    return this.http.post<FormDashboard[]>(`${this.apiUrl}/forms/${clientId}`, statusForm);
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

  duplicateForm(formId: number, formName: string): Observable<FormStructure> {
    return this.http.post<FormStructure>(`${this.apiUrl}/forms/${formId}/duplicate`, { formName: formName });
  }

  renameForm(formId: number, name: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forms/${formId}/rename`, { name });
  }

  getLogoBase64ByFormId(formId: number): Observable<{ logoBase64: string }> {
    return this.http.get<{ logoBase64: string }>(`${this.apiUrl}/forms/${formId}/logo`);
  }

  getSettingsByFormIdAsync(formId: number): Observable<FormSettings> {
    return this.http.get<FormSettings>(`${this.apiUrl}/forms/${formId}/settings`);
  }

  getFormStyle(formId: number) {
    return this.http.get<FormStyleDto>(`${this.apiUrl}/forms/${formId}/style`);
  }

  saveFormStyle(formId: number, style: FormStyleDto) {
    return this.http.post(`${this.apiUrl}/forms/${formId}/style`, style);
  }

  inactivateForm(formId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forms/${formId}/inactivate`, {});
  }

  activateForm(formId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forms/${formId}/activate`, {});
  }

}
