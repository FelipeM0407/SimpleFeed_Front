import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbacksService {

  private apiUrl = `${environment.apiUrl}/feedbacks`;

  constructor(private http: HttpClient) {}

  getFeedbacks(formId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${formId}`);
  }
}
