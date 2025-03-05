import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AccountService } from '../account/services/account.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { telefoneValidator, cnpjValidator, cpfValidator } from '../../../app/shared/Util/validators';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

// Import dos módulos do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from 'src/app/core/auth.service';
import { Account } from './Models/Account';
import { MatDialog } from '@angular/material/dialog';
import { PasswordModalComponent } from './components/password-modal/password-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    MatCardModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  providers: [provideNgxMask()],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  accountForm!: FormGroup;
  passwordForm!: FormGroup;
  isMobile: boolean = false;
  accountData!: Account;


  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {

    this.accountService.getAccount(this.authService.getUserGuid()).subscribe(account => {
      this.accountData = account;
      this.populateForm(account);
    });

    // Detecta se é mobile (handset)
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    });

    // Formulário para dados comuns
    this.accountForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, telefoneValidator]],
      documentType: ['CPF', Validators.required],
      document: ['', [Validators.required, cpfValidator]],
      name: ['', [Validators.minLength(15), Validators.maxLength(100)]] // Será validado somente se o tipo for CNPJ
    });

    this.accountForm.get('documentType')?.valueChanges.subscribe((value: string) => {
      const documentControl = this.accountForm.get('document');
      const companyControl = this.accountForm.get('name');
      if (value === 'CPF') {
        documentControl?.setValidators([Validators.required, cpfValidator]);
        companyControl?.clearValidators();
        companyControl?.setValue(''); // Limpa o nome da empresa se houver
      } else if (value === 'CNPJ') {
        documentControl?.setValidators([Validators.required, cnpjValidator]);
        companyControl?.setValidators([Validators.required, Validators.maxLength(200)]);
      }
      documentControl?.updateValueAndValidity();
      companyControl?.updateValueAndValidity();
    });

    // Formulário para alteração de senha
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: this.passwordMatchValidator });
  }

  populateForm(account: Account): void {
    this.accountForm.patchValue({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      phoneNumber: account.phoneNumber,
      documentType: account.cpf ? 'CPF' : 'CNPJ',
      document: account.cpf || account.cnpj,
      name: account.cnpj ? account.name : ''
    });

    if (account.cpf) {
      this.accountForm.get('documentType')?.setValue('CPF');
      this.accountForm.get('document')?.setValidators([Validators.required, cpfValidator]);
    } else if (account.cnpj) {
      this.accountForm.get('documentType')?.setValue('CNPJ');
      this.accountForm.get('document')?.setValidators([Validators.required, cnpjValidator]);
      this.accountForm.get('name')?.setValidators([Validators.required, Validators.maxLength(200)]);
    }

    this.accountForm.get('document')?.updateValueAndValidity();
    this.accountForm.get('name')?.updateValueAndValidity();
  }

  passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const passwordControl = formGroup.get('password');
    const confirmControl = formGroup.get('confirmPassword');
    if (!passwordControl || !confirmControl) return null;

    // Se o controle de confirmação já possui outros erros (exceto passwordsMismatch), não faz nada
    if (confirmControl.errors && !confirmControl.errors['passwordsMismatch']) {
      return null;
    }

    if (passwordControl.value !== confirmControl.value) {
      // Mantém os erros já existentes e adiciona o passwordsMismatch
      confirmControl.setErrors({ ...confirmControl.errors, passwordsMismatch: true });
    } else {
      // Remove o erro de passwordsMismatch, preservando os demais
      if (confirmControl.errors) {
        delete confirmControl.errors['passwordsMismatch'];
        if (Object.keys(confirmControl.errors).length === 0) {
          confirmControl.setErrors(null);
        }
      }
    }
    return null;
  }

  // Reinicia o campo "document" ao trocar o tipo
  onDocumentTypeChange(event: any): void {
    this.accountForm.get('document')?.reset();
  }

  // Valida e envia o formulário de dados comuns
  submitAccountForm(): void {
    if (this.accountForm.valid) {
      let accountData: Account = this.accountForm.value;

      // Se o tipo de documento for CPF, o nome é a concatenação do primeiro e último nome
      if (this.accountForm.get('documentType')?.value === 'CPF') {
        accountData.name = `${this.accountForm.get('firstName')?.value} ${this.accountForm.get('lastName')?.value}`;
      }

      this.accountService.updateAccount(this.authService.getUserGuid(), accountData).subscribe(
        response => {
          this.snackBar.open('Dados atualizados com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        },
        error => {
          this.snackBar.open('Erro ao atualizar os dados.', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          console.error(error);
        }
      );
    } else {
      this.accountForm.markAllAsTouched();
    }
  }

  // Abre a modal para alteração de senha
  openPasswordModal(): void {
    this.dialog.open(PasswordModalComponent, {
      width: '400px',
      // Outras configurações...
    });
  }

  // Fecha a modal e reseta o formulário de senha
  closePasswordModal(): void {
    this.passwordForm.reset();
  }

  // Valida e envia o formulário de alteração de senha
  submitPasswordChange(): void {
    if (this.passwordForm.valid) {
      console.log('Senha atualizada:', this.passwordForm.value);
      // Exemplo: this.accountService.updatePassword(this.passwordForm.value).subscribe(...);
      this.closePasswordModal();
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }
}
