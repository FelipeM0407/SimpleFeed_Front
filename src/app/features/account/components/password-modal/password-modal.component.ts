import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-password-modal',
  standalone: true,
  templateUrl: './password-modal.component.html',
  styleUrls: ['./password-modal.component.scss'],
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    MatSnackBarModule
  ]
})
export class PasswordModalComponent implements OnInit {
  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PasswordModalComponent>,
    private accountService: AccountService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
    }, { validator: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    if (!newPassword || !confirmPassword) {
      return null;
    }
    if (newPassword.value !== confirmPassword.value) {
      // Mantém os erros já existentes e adiciona o erro passwordsMismatch
      confirmPassword.setErrors({ passwordsMismatch: true });
    } else {
      if (confirmPassword.errors) {
        delete confirmPassword.errors['passwordsMismatch'];
        if (!Object.keys(confirmPassword.errors).length) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }
  

  onSubmit(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      this.accountService.changePassword({ currentPassword, newPassword }).subscribe(
        response => {
          console.log(response);
          this.snackBar.open('Senha alterada com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.dialogRef.close();
        },
        error => {
          if (error.status === 401) {
            this.passwordForm.get('currentPassword')?.setErrors({ incorrectPassword: true });
          } else {
            console.error(error);
          }
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
