import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { InvoiceDto } from '../models/invoce-model';
import { Observable } from 'rxjs';
import { Plan } from 'src/app/shared/Models/Plans';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getFatura(clienteId: number, mesReferencia: string): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.apiUrl}/BillingSummary/${clienteId}`, { params: { referenceMonth: `${mesReferencia}-01` } }
    );
  }

  getPlanosDisponiveis(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/Plans`);
  }


  migrarPlano(planId: number, clienteId: number): Observable<any> {
    const dto = {
      ClientId: clienteId,
      NewPlanId: planId
    };
    return this.http.post(`${this.apiUrl}/BillingSummary/migrate-plan`, dto);
  }



}
