import { Component, OnInit } from '@angular/core';
import { FormDashboard } from '../../models/FormDashboard';
import { FormsService } from '../../services/forms.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth.service';
import { Subscription } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';



@Component({
  selector: 'app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss',],
  standalone: true,
  imports: [ CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatTableModule, MatMenuModule, MatButtonModule],
})
export class FormsListComponent implements OnInit {
  forms: FormDashboard[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  private clientDataSubscription: Subscription | null = null;


  constructor(private formsService: FormsService, private authService: AuthService) { }

  ngOnInit(): void {
    // Aguarda os dados do cliente
    this.clientDataSubscription = this.authService.getClientData().subscribe({
      next: (clientData) => {
        if (clientData) {
          const clientId = clientData.id;
          this.loadForms(clientId); // Carrega os formulários assim que os dados do cliente estão disponíveis
        }
      },
    });
  }

  loadForms(clientId: number): void {
    this.formsService.getForms(clientId).subscribe({
      next: (data) => {
        this.forms = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar os formulários.';
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.clientDataSubscription?.unsubscribe();
  }
}
