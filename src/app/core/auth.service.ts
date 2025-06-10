import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import jwt_decode from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private clientDataSubject = new BehaviorSubject<any>(null); // Mantém e emite os dados do cliente
  constructor(private http: HttpClient) { }

  getDecodedToken() {
    const token = localStorage.getItem('authToken');
    if (token) {
      return jwt_decode(token);
    }
    return null;
  }

  getClientId() {
    const decodedToken: any = this.getDecodedToken();
    return decodedToken?.client_id || null;
  }

  getUserGuid() {
    const decodedToken: any = this.getDecodedToken();
    return decodedToken?.id || null;
  }
  getUserName() {
    const decodedToken: any = this.getDecodedToken();
    return decodedToken?.name || null;
  }

  getUserEmail() {
    const decodedToken: any = this.getDecodedToken();
    return decodedToken?.sub || null;
  }

  setClientData(data: any): void {
    this.clientDataSubject.next(data);
  }

  getClientData(): Observable<any> {
    return this.clientDataSubject.asObservable();
  }

  fetchClientData(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/client/${userId}`);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }
}