import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../components/success-dialog/success-dialog.component';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false; // Para controle do estado de carregamento
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (confirmPassword === null || confirmPassword === '') {
      formGroup.get('confirmPassword')?.setErrors({ required: true });
      return { required: true };
    }

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ notMatching: true });
      return { notMatching: true };
    }

    formGroup.get('confirmPassword')?.setErrors(null);
    return null;
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;

      this.errorMessage = null; // Limpar qualquer mensagem de erro anterior
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.openSuccessDialog(); // Abre o modal de sucesso
        },
        error: (err: any) => {
          console.error('Erro ao registrar usuário', err);
          this.isLoading = false;
          
          if (err.status === 400 && Array.isArray(err.error)) {
            const duplicateError = err.error.find((e: any) => e.code === 'DuplicateUserName');
            if (duplicateError) {
              this.registerForm.get('email')?.setErrors({ duplicate: true }); // Marca o campo de e-mail como inválido
              this.errorMessage = 'O e-mail informado já está cadastrado. Por favor, use outro e-mail.';
            } else {
              this.errorMessage = 'Ocorreu um erro ao processar o registro. Verifique os dados e tente novamente.';
            }
          } else {
            this.errorMessage = 'Erro de conexão. Por favor, tente novamente mais tarde.';
          }
        }
      });
    }
  }

  openSuccessDialog() {
    const dialogRef = this.dialog.open(SuccessDialogComponent, {
      width: '350px',
      data: { message: 'Cadastro realizado com sucesso! Faça login para continuar.' }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/login']); // Direciona para a tela de login após o fechamento do modal
    });
  }


  goToLogin() {
    this.router.navigate(['/login']);
  }
}
