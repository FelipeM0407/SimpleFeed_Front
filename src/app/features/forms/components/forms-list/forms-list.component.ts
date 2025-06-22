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
import { MAT_RADIO_DEFAULT_OPTIONS, MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QrCodeCustomComponent } from './qr-code-custom/qr-code-custom.component';

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
  imports: [QrCodeCustomComponent, MatTooltipModule, MatCheckboxModule, MatRadioModule, CdkDrag, MatChipsModule, MatBadgeModule, ReactiveFormsModule, FormsModule, MatSelectModule, MatFormFieldModule, QRCodeModule, MatSnackBarModule, MatDialogModule, MatProgressBarModule, MatDividerModule, CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatTableModule, MatMenuModule, MatButtonModule],
  providers: [{
    provide: MAT_RADIO_DEFAULT_OPTIONS,
    useValue: { color: 'primary' },
  }]
})
export class FormsListComponent implements OnInit, OnDestroy {
  forms: FormDashboard[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  maxResponses = 500; // Limite temporário de respostas
  private clientDataSubscription: Subscription | null = null;
  @ViewChild('confirmDialog', { static: true }) confirmDialog!: TemplateRef<any>;
  qrCodeUrl: string | null = null;
  logoBase64: string | null = null;
  @ViewChild('qrCodeDialog', { static: true }) qrCodeDialog!: TemplateRef<any>;
  nameForm: string = '';
  formNames: string[] = [];
  clientId!: number;
  selectedForm!: FormDashboard;
  selectedStatus: string = 'ativo';
  isActive = true;
  isInativo = false;
  isNaoLido = false;
  isPremiumUser: boolean = false; // Troque depois pela lógica real do plano

  @ViewChild(QrCodeCustomComponent) qrCodeComponent!: QrCodeCustomComponent;

  @ViewChild('planLimitDialog', { static: true }) planLimitDialog!: TemplateRef<any>;
  @ViewChild('planChargeDialog', { static: true }) planChargeDialog!: TemplateRef<any>;


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
    },
    {
      name: 'Data de Inativação',
      ordenation: [
        { value: 'inativacaoDecrescente', viewValue: 'Decrescente' },
        { value: 'inativacaoCrescente', viewValue: 'Crescente' },
      ],
    },

  ];

  ordenationControl = new FormControl(
    this.ordenationGroups
      .flatMap(group => group.ordenation) // Achata a lista para buscar diretamente nas opções
      .find(order => order.checked)?.value || ''
  );
  clientGuid: string;

  constructor(private snackBar: MatSnackBar, private formsService: FormsService, private authService: AuthService, private router: Router,
    public dialog: MatDialog, private sanitizer: DomSanitizer
  ) {
    this.clientId = this.authService.getClientId();
    this.clientGuid = this.authService.getUserGuid();
  }

  ngOnInit(): void {
    this.loadForms(this.clientId);
  }

  onStatusChange(): void {
    // Lógica de atualização do status baseado na escolha do radio button
    this.isActive = this.selectedStatus === 'ativo';
    this.isInativo = this.selectedStatus === 'inativo';

    // Carregar os formulários com base no status
    this.loadForms(this.clientId);
  }
  onCreateForm(): void {
    this.isLoading = true;

    this.formsService.getServicesAvailableByPlan(this.clientGuid).subscribe({
      next: (services: any) => {

        if (services.totalFormulariosAtivosMes >= services.limiteFormularios) {

          if (services.planoId === 1 && !services.podeExtenderFormulario) {
            this.dialog.open(this.planLimitDialog, {
              data: { planoNome: services.planoNome, limiteFormularios: services.limiteFormularios },
              width: '400px'
            });
            return;
          }

          if (services.criacaoGeraraCobranca) {
            const dialogRef = this.dialog.open(this.planChargeDialog, {
              data: {
                planoNome: services.planoNome,
                totalFormulariosAtivosMes: services.totalFormulariosAtivosMes,
                limiteFormularios: services.limiteFormularios
              },
              width: '400px'
            });

            dialogRef.afterClosed().subscribe((confirmed) => {
              if (confirmed === 'true') {
                this.openCreateFormDialog();
              }
            });
            return;
          }
        }

        this.openCreateFormDialog();
      },
      error: () => {
        this.errorMessage = 'Erro ao verificar o plano do cliente.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  openCreateFormDialog() {
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
    const statusForm = {
      isActive: this.isActive,
      isInativo: this.isInativo,
      isNaoLido: this.isNaoLido
    };
    this.isLoading = true;

    this.formsService.getForms(clientId, statusForm).subscribe({
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

  //metodo para inativar o formulário
  inactivateForm(id: number): void {
    this.openConfirmDialog(this.confirmDialog, 'Tem certeza de que deseja inativar esse formulário?')
      .subscribe((confirmed: any) => {
        if (confirmed == 'true') {
          this.isLoading = true; // Exibe o loading

          this.formsService.inactivateForm(id).subscribe({
            next: () => {
              this.snackBar.open('Formulário inativado com sucesso!', 'Fechar', {
                duration: 3000,
                panelClass: ['snackbar-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.loadForms(this.clientId);
            },
            error: () => {
              this.snackBar.open('Erro ao inativar formulário!', 'Fechar', {
                duration: 3000,
                panelClass: ['snackbar-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            }
          });
        }
      }
      );
  }
  //metodo para ativar o formulário
  activateForm(id: number): void {
    this.isLoading = true;

    this.formsService.getFormReactivationStatus(id).subscribe({
      next: (services: any) => {

        if (services.totalFormulariosAtivosMes >= services.limiteFormularios) {

          if (services.planoId === 1 && !services.podeExtenderFormulario) {
            this.dialog.open(this.planLimitDialog, {
              data: { planoNome: services.planoNome, limiteFormularios: services.limiteFormularios },
              width: '400px'
            });
            return;
          }

          if (services.criacaoGeraraCobranca) {
            const dialogRef = this.dialog.open(this.planChargeDialog, {
              data: {
                planoNome: services.planoNome,
                totalFormulariosAtivosMes: services.totalFormulariosAtivosMes,
                limiteFormularios: services.limiteFormularios
              },
              width: '400px'
            });

            dialogRef.afterClosed().subscribe((confirmed) => {
              if (confirmed === 'true') {
                this.ativacaoConfirmada(id);
              }
            });
            return;
          }
        }

        this.ativacaoConfirmada(id);
      },
      error: () => {
        this.errorMessage = 'Erro ao verificar o plano do cliente.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });




  }

  ativacaoConfirmada(formId: number) {

    this.openConfirmDialog(this.confirmDialog, 'Tem certeza de que deseja ativar esse formulário?')
      .subscribe((confirmed: any) => {
        if (confirmed == 'true') {
          this.isLoading = true; // Exibe o loading

          this.formsService.activateForm(formId).subscribe({
            next: () => {
              this.snackBar.open('Formulário ativado com sucesso!', 'Fechar', {
                duration: 3000,
                panelClass: ['snackbar-success'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.loadForms(this.clientId);
            },
            error: () => {
              this.snackBar.open('Erro ao ativar formulário!', 'Fechar', {
                duration: 3000,
                panelClass: ['snackbar-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            }
          });
        }
      });
  }

  duplicateForm(id: number) {

    this.isLoading = true;

    this.formsService.getServicesAvailableByPlan(this.clientGuid).subscribe({
      next: (services: any) => {

        if (services.totalFormulariosAtivosMes >= services.limiteFormularios) {

          if (services.planoId === 1 && !services.podeExtenderFormulario) {
            this.dialog.open(this.planLimitDialog, {
              data: { planoNome: services.planoNome, limiteFormularios: services.limiteFormularios },
              width: '400px'
            });
            return;
          }

          if (services.criacaoGeraraCobranca) {
            const dialogRef = this.dialog.open(this.planChargeDialog, {
              data: {
                planoNome: services.planoNome,
                totalFormulariosAtivosMes: services.totalFormulariosAtivosMes,
                limiteFormularios: services.limiteFormularios
              },
              width: '400px'
            });

            dialogRef.afterClosed().subscribe((confirmed) => {
              if (confirmed === 'true') {
                this.duplicacaoConfirmada(id);
              }
            });
            return;
          }
        }

        this.duplicacaoConfirmada(id)

      },
      error: () => {
        this.errorMessage = 'Erro ao verificar o plano do cliente.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });


  }

  duplicacaoConfirmada(formId: number) {
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
          this.formsService.duplicateForm(formId, result).subscribe({
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
    this.formsService.getLogoBase64ByQrCode(formId).subscribe(
      (result) => {
        const frontUrl = this.formsService.getFrontUrl();
        const url = `${frontUrl}/feedback-submission/${formId}`;
        
        if (url) {
          this.logoBase64 = result.qrCodeLogoBase64 ?? '';
          this.nameForm = nameForm;
          this.qrCodeUrl = url;
          this.dialog.open(this.qrCodeDialog);
        } else {
          console.error('URL inválida para o QR Code');
        }
      },
      () => {
        console.error('Erro ao buscar o logo para o QR Code');
      }
    );
  }

  downloadQRCode() {
    this.qrCodeComponent.download();
  }

  // downloadQRCode() {
  //   const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  //   const link = document.createElement('a');
  //   link.href = canvas.toDataURL('image/png');
  //   link.download = `QR Code ${this.nameForm}.png`;
  //   link.click();
  // }

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
      case 'inativacaoDecrescente':
        this.forms.sort((a, b) => {
          const dateA = a.inativationDate ? new Date(a.inativationDate).getTime() : -Infinity;
          const dateB = b.inativationDate ? new Date(b.inativationDate).getTime() : -Infinity;
          return dateB - dateA;
        });
        break;

      case 'inativacaoCrescente':
        this.forms.sort((a, b) => {
          if (!a.inativationDate && !b.inativationDate) return 0;
          if (!a.inativationDate) return -1;
          if (!b.inativationDate) return 1;
          return new Date(a.inativationDate).getTime() - new Date(b.inativationDate).getTime();
        });
        break;



      default:
        break;
    }
  }

  downloadCustomQRCode() {
    this.qrCodeComponent.download();
  }
}


