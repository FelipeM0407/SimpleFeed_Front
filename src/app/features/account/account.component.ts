import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../account/services/account.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  accountForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(/\(\d{2}\)\s\d{5}-\d{4}/)]],
      documentType: ['CPF', Validators.required],
      document: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador customizado para garantir que as senhas coincidam
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onDocumentTypeChange(event: Event): void {
    // Reinicia o campo document ao trocar o tipo
    this.accountForm.get('document')?.reset();
  }

  // Método de validação dos campos – pode ser expandido conforme necessário
  validateFields(): boolean {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return false;
    }
    return true;
  }

  // Método para envio/edição – utilize este stub para customizar a chamada ao AccountService
  submitForm(): void {
    if (this.validateFields()) {
      // const formData = this.accountForm.value;
      // this.accountService.updateAccount(formData).subscribe(response => {
      //   console.log('Dados atualizados', response);
      // });
    }
  }
}
