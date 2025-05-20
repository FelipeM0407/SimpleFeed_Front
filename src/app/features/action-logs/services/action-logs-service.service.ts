import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActionLogResult } from '../models/ActionLogResult ';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActionLogsService {
  private apiUrl = `${environment.apiUrl}/actionslog`;

  constructor(private http: HttpClient) {}

  getLogs(clientId: number, actionTypes?: number[], startDate?: Date, endDate?: Date): Observable<ActionLogResult[]> {
    let params = new HttpParams().set('ClientId', clientId.toString());

    if (actionTypes && actionTypes.length > 0) {
      actionTypes.forEach(type => {
        params = params.append('ActionTypes', type.toString());
      });
    }

    if (startDate) {
      params = params.set('StartDate', startDate.toISOString());
    }

    if (endDate) {
      params = params.set('EndDate', endDate.toISOString());
    }

    return this.http.get<ActionLogResult[]>(this.apiUrl, { params });
  }
}
