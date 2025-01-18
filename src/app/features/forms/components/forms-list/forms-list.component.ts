import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormDashboard } from '../../models/FormDashboard';
import { FormsService } from '../../services/forms.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth.service';
import { Observable, Subscription } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormCreateDialogComponent } from '../form-create-dialog/form-create-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss',],
  standalone: true,
  imports: [MatSnackBarModule, MatDialogModule, MatProgressBarModule, MatDividerModule, CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatTableModule, MatMenuModule, MatButtonModule],
})
export class FormsListComponent implements OnInit, OnDestroy {
  forms: FormDashboard[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  maxResponses = 100; // Limite temporário de respostas
  private clientDataSubscription: Subscription | null = null;
  @ViewChild('confirmDialog', { static: true }) confirmDialog!: TemplateRef<any>;
  clientId!: number;

  constructor(private snackBar: MatSnackBar, private formsService: FormsService, private authService: AuthService, private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.clientDataSubscription = this.authService.getClientData().subscribe({
      next: (clientData) => {
        if (clientData) {
          this.clientId = clientData.id;
          this.loadForms(this.clientId);
        }
      },
    });
  }

  onCreateForm(): void {
    const dialogRef = this.dialog.open(FormCreateDialogComponent, {
      data: { name: 'form_creation_dialog' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.formsService.createForm(result).subscribe({
          next: (formIdCreated: any) => {
            this.router.navigate(['/dashboard/form-edit', formIdCreated.formId]);
          },
          error: () => {
            this.errorMessage = 'Erro ao criar o formulário.';
          }
        });
      }
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

  ngOnDestroy(): void {
    this.clientDataSubscription?.unsubscribe();
  }

  onViewResponses(id: number): void {
    this.router.navigate(['/dashboard/feedbacks', id]);
  }

  editForm(id: number): void {
    this.router.navigate(['/dashboard/form-edit', id]);
  }

  deleteForm(id: number): void {
    this.openConfirmDialog(this.confirmDialog, 'Excluir esse formulário irá também excluir todos os feedbacks a ele associados. Tem certeza de que deseja excluí-lo?')
      .subscribe((confirmed: any) => {
        if (confirmed == 'true') {
          this.isLoading = true; // Exibe o loading

          this.formsService.deleteForm(id).subscribe({
            next: () => {
              this.snackBar.open('Formulário Removido com sucesso!', 'Fechar', {
                duration: 3000,
                panelClass: ['snackbar-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.loadForms(this.clientId);
            },
            error: () => {
              this.snackBar.open('Erro ao excluir formulário!', 'Fechar', {
                duration: 3000,
                panelClass: ['snackbar-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            },
            complete: () => {
              this.isLoading = false; // Esconde o loading
            }
          });
        }
      });
  }

  openConfirmDialog(templateRef: TemplateRef<any>, message: string): Observable<boolean> {
    const dialogRef = this.dialog.open(templateRef, {
      data: { message },
      width: '300px',
    });

    return dialogRef.afterClosed(); // Retorna o resultado do diálogo
  }
}


