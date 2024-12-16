import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
  selector: 'app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss',],
  standalone: true,
  imports: [MatProgressBarModule, MatDividerModule, CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatTableModule, MatMenuModule, MatButtonModule],
})
export class FormsListComponent implements OnInit, OnDestroy {
  forms: FormDashboard[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  maxResponses = 10; // Limite temporário de respostas
  private clientDataSubscription: Subscription | null = null;


  constructor(private formsService: FormsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.clientDataSubscription = this.authService.getClientData().subscribe({
      next: (clientData) => {
        if (clientData) {
          const clientId = clientData.id;
          this.loadForms(clientId);
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

  getTotalResponses(): number {
    return this.forms.reduce((total, form) => total + form.responseCount, 0);
  }

  getTotalResponsesPercentage(): number {
    return Math.min((this.getTotalResponses() / this.maxResponses) * 100, 100);
  }

  onCreateForm(): void {
    // Implementar lógica para criar formulário
    console.log('Criar Formulário');
  }

  ngOnDestroy(): void {
    this.clientDataSubscription?.unsubscribe();
  }
}
