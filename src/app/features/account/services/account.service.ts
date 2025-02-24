import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor() { }

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

  /**
   * Simula a recuperação dos dados da conta.
   * Retorna um Observable com dados fictícios após 1 segundo.
   */
  getAccount(): Observable<any> {
    const fakeAccountData = {
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.silva@example.com',
      phone: '(11) 91234-5678',
      documentType: 'CPF',
      document: '123.456.789-00'
    };
    return of(fakeAccountData).pipe(delay(1000));
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
