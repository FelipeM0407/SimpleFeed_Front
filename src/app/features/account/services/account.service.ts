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

  getAccount(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/account/${accountId}`);
  }

  changePassword(data: { currentPassword: string, newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, data, { responseType: 'text' });
  }

  updateAccount(accountId: string, accountData: Account): Observable<any> {
    return this.http.post(`${this.apiUrl}/account/${accountId}`, accountData, { responseType: 'text' });
  }
  
}
