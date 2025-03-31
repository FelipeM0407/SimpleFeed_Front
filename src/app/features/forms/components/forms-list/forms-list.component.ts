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
import { HttpClient } from '@angular/common/http';
import { DialogRenameFormComponent } from './dialog-rename-form/dialog-rename-form.component';
import { DomSanitizer } from '@angular/platform-browser';
import { QRCodeModule } from 'angularx-qrcode';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { CdkDrag } from '@angular/cdk/drag-drop';


interface Ordenation {
  value: string;
  viewValue: string;
  checked?: boolean;
}

interface OrdenationGroup {
  disabled?: boolean;
  name: string;
  ordenation: Ordenation[];
}

@Component({
  selector: 'app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss',],
  standalone: true,
  imports: [CdkDrag, MatChipsModule, MatBadgeModule, ReactiveFormsModule, FormsModule, MatSelectModule, MatFormFieldModule, QRCodeModule, MatSnackBarModule, MatDialogModule, MatProgressBarModule, MatDividerModule, CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatTableModule, MatMenuModule, MatButtonModule],
})
export class FormsListComponent implements OnInit, OnDestroy {
  forms: FormDashboard[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  maxResponses = 500; // Limite temporário de respostas
  private clientDataSubscription: Subscription | null = null;
  @ViewChild('confirmDialog', { static: true }) confirmDialog!: TemplateRef<any>;
  qrCodeUrl: string | null = null;
  @ViewChild('qrCodeDialog', { static: true }) qrCodeDialog!: TemplateRef<any>;
  nameForm: string = '';
  formNames: string[] = [];

  clientId!: number;


  ordenationGroups: OrdenationGroup[] = [
    {
      name: 'Qtd. Respostas',
      ordenation: [
        { value: 'respostasDecrescente', viewValue: 'Decrescente' },
        { value: 'respostasCrescente', viewValue: 'Crescente' },
      ],
    },
    {
      name: 'Data de Criação',
      ordenation: [
        { value: 'criacaoDecrescente', viewValue: 'Decrescente', checked: true },
        { value: 'criacaoCrescente', viewValue: 'Crescente' },
      ],
    },
    {
      name: 'Data de Atualização',
      ordenation: [
        { value: 'atualizacaoDecrescente', viewValue: 'Decrescente' },
        { value: 'atualizacaoCrescente', viewValue: 'Crescente' },
      ],
    }
  ];

  ordenationControl = new FormControl(
    this.ordenationGroups
      .flatMap(group => group.ordenation) // Achata a lista para buscar diretamente nas opções
      .find(order => order.checked)?.value || ''
  );



  constructor(private snackBar: MatSnackBar, private formsService: FormsService, private authService: AuthService, private router: Router,
    public dialog: MatDialog, private sanitizer: DomSanitizer
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
        this.formsService.setFormNames(this.forms.map(form => form.name));
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

  duplicateForm(id: number) {
    const dialogRef = this.dialog.open(DialogRenameFormComponent, {
      data: { formName: '', title: 'Duplicar Formulário' },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (this.formNames.includes(result)) {
          this.snackBar.open('Nome do formulário já existe!', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        } else {
          this.formsService.duplicateForm(id, result).subscribe({
            next: (duplicatedForm) => {
              this.snackBar.open('Formulário duplicado com sucesso!', 'Fechar', {
                duration: 3000,
                panelClass: ['snackbar-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.loadForms(this.clientId);
            },
            error: () => {
              this.snackBar.open('Erro ao duplicar formulário!', 'Fechar', {
                duration: 3000,
                panelClass: ['snackbar-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            }
          });
        }
      }
    });
  }

  renameForm(formId: number, formName: string) {
    const dialogRef = this.dialog.open(DialogRenameFormComponent, {
      data: { formName: formName, title: 'Renomear Formulário' },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.isLoading = true;

        this.formsService.renameForm(formId, result).subscribe({
          next: () => {
            this.snackBar.open('Formulário renomeado com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-success'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.loadForms(this.clientId);
          },
          error: () => {
            this.snackBar.open('Erro ao renomear formulário!', 'Fechar', {
              duration: 3000,
              panelClass: ['snackbar-error'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          },
          complete: () => {
            this.isLoading = false;
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

  viewQRCode(formId: number, nameForm: string) {
    const frontUrl = this.formsService.getFrontUrl();
    const url = `${frontUrl}/feedback-submission/${formId}`;

    if (url) {
      this.nameForm = nameForm;
      this.qrCodeUrl = url;
      this.dialog.open(this.qrCodeDialog);
    } else {
      console.error('URL inválida para o QR Code');
    }
  }

  downloadQRCode() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `QR Code ${this.nameForm}.png`;
    link.click();
  }

  copyLink(formId: number) {
    const frontUrl = this.formsService.getFrontUrl();
    const url = `${frontUrl}/feedback-submission/${formId}`;

    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Link copiado para a área de transferência!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success'],
          horizontalPosition: 'center',

          verticalPosition: 'top'
        });
      });
    }
  }

  onOrdenationChange(event: string) {
    const ordenationValue = event;

    switch (ordenationValue) {
      case 'respostasDecrescente':
        this.forms.sort((a, b) => b.responseCount - a.responseCount);
        break;
      case 'respostasCrescente':
        this.forms.sort((a, b) => a.responseCount - b.responseCount);
        break;
      case 'criacaoDecrescente':
        this.forms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'criacaoCrescente':
        this.forms.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'atualizacaoDecrescente':
        this.forms.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'atualizacaoCrescente':
        this.forms.sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
        break;
      default:
        break;
    }
  }
}


