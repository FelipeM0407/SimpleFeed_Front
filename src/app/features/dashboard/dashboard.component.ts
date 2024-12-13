import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  userName: string | null = null;
  userEmail: string | null = null;

  constructor(private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.userEmail = this.authService.getUserEmail();
  }

  goToAccount() {
    this.router.navigate(['/account']); // Redirecionar para a tela de "Minha conta"
  }

  logout(): void {
    localStorage.removeItem('authToken'); // Remove o token do localStorage
    this.router.navigate(['/login']); // Redireciona para a tela de login
  }
}
