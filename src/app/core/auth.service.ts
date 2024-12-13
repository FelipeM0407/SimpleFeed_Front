import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import jwt_decode from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getDecodedToken() {
    const token = localStorage.getItem('authToken');
    if (token) {
      return jwt_decode(token);
    }
    return null;
  }
  

  getUserName() {
    const decodedToken: any = this.getDecodedToken();
    return decodedToken?.name || null;
  }

  getUserEmail() {
    const decodedToken: any = this.getDecodedToken();
    return decodedToken?.sub || null;
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }
}