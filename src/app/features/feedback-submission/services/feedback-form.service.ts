import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackFormService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  checkAccess(formId: string): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/feedbackform/${formId}/check`);
  }

  submitFeedback(formId: string, feedback: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/feedbackform/${formId}/feedback`, feedback);
  }

  loadForm(formId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/feedbackform/${formId}`);
  }

  
}
