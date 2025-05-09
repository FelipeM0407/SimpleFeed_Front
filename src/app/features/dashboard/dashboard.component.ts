import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { MatTooltipModule} from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, MatListModule, MatSidenavModule, MatTooltipModule, RouterModule, MatDividerModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
})
export class DashboardComponent implements OnInit {
  userName: string | null = null;
  userEmail: string | null = null;
  mobileQuery: MediaQueryList;
  fillerNav = Array.from({length: 5}, (_, i) => `Nav Item ${i + 1}`);
  fillerContent = Array.from(
    {length: 15},
    () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  );

  constructor(private router: Router, private authService: AuthService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');

  }

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.userEmail = this.authService.getUserEmail();

    const userGuid = this.authService.getUserGuid();
    if (userGuid) {
      this.authService.fetchClientData(userGuid).subscribe({
        next: (data) => {
          this.authService.setClientData(data);
        },
        error: (err) => {
          console.error('Erro ao buscar os dados do cliente:', err);
          this.logout();
        },
      });
    } else {
      this.logout();
    }
  }

  goToAccount() {
    this.router.navigate(['/dashboard/account']);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  openWhatsApp(): void {
    const phoneNumber = '5511985159703'; // Substitua pelo número desejado (código do país incluso, sem espaços ou sinais)
    const message = encodeURIComponent('Olá, gostaria de enviar um feedback.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  }

}
