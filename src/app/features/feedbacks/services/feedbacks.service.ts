import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbacksService {

  private apiUrl = `${environment.apiUrl}/feedbacks`;

  constructor(private http: HttpClient) { }

  getFeedbacks(formId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${formId}`);
  }

  deleteFeedbacks(feedbackIds: number[]): Observable<void> {
    return this.http.request<void>('delete', `${this.apiUrl}/delete`, {
      body: feedbackIds
    });
  } 

  applyFilters(formId: number, dateRange: { start: Date, end: Date }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${formId}/filter`, {
      Submitted_Start: dateRange.start || null,
      Submitted_End: dateRange.end || null
    });
  }

}
