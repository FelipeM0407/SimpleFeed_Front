import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Account } from '../Models/Account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * Simula a atualização de uma conta.
   * Retorna um Observable que emula uma resposta de sucesso após 1 segundo.
   */
  updateAccount(data: any): Observable<any> {
    console.log('Dados para atualização:', data);
    return of({
      success: true,
      message: 'Conta atualizada com sucesso!',
      data
    }).pipe(delay(1000));
  }

  getAccount(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/account/${accountId}`);
  }

  /**
   * Simula a criação de uma nova conta.
   * Retorna um Observable que emula uma resposta de sucesso após 1 segundo.
   */
  createAccount(data: any): Observable<any> {
    console.log('Dados para criação de conta:', data);
    return of({
      success: true,
      message: 'Conta criada com sucesso!',
      data
    }).pipe(delay(1000));
  }
}
