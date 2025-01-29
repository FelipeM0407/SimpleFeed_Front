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

  submitFeedback(feedback: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/feedbackform/feedback`, feedback);
  }

  loadForm(formId: string): Observable<void> {
    return this.http.get<any>(`${this.apiUrl}/feedbackform/${formId}`);
  }

  
}
