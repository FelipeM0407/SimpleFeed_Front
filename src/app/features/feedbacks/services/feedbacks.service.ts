import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReportsIA } from '../models/ReportsIAs';
import { DetailReport } from '../models/DetailReport';
import { ReportCreationStatus } from '../../forms/models/ReportCreationStatus';

@Injectable({
  providedIn: 'root'
})
export class FeedbacksService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getFeedbacks(formId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/feedbacks/${formId}`);
  }

  deleteFeedbacks(feedbackIds: number[]): Observable<void> {
    return this.http.request<void>('delete', `${this.apiUrl}/feedbacks/delete`, {
      body: feedbackIds
    });
  }

  applyFilters(formId: number, dateRange: { start: string, end: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/feedbacks/${formId}/filter`, {
      Submitted_Start: dateRange.start || null,
      Submitted_End: dateRange.end || null
    });
  }

  getReportsIa(formId: number, startDate: string, endDate: string): Observable<ReportsIA[]> {
    return this.http.get<ReportsIA[]>(`${environment.apiUrl}/reports/reports-ia/${formId}`, {
      params: { startDate, endDate }
    });
  }



  generateIaReport(dto: {
    clientId: number;
    formId: number;
    dataInicio?: string;
    dataFim?: string;
    contextoNegocio: string;
  }): Observable<DetailReport> {
    return this.http.post<DetailReport>(
      `${this.apiUrl}/reports/gerar-report-ia`,
      {
        clientId: dto.clientId,
        formId: dto.formId,
        dataInicio: dto.dataInicio ?? null,
        dataFim: dto.dataFim ?? null,
        contextoNegocio: dto.contextoNegocio
      }
    );
  }

  getReportIaById(reportId: number): Observable<DetailReport> {
    return this.http.get<DetailReport>(`${this.apiUrl}/reports/report-ia/${reportId}`);
  }

  getServicesAvailableByPlan(clientId: string): Observable<ReportCreationStatus> {
    return this.http.get<any>(`${this.apiUrl}/reports/${clientId}/services-available-ia-reports`);
  }

}
