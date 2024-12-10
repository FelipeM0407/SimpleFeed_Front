import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordsMatch }
    );
  }

  passwordsMatch(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (confirmPassword && password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ notMatching: true });
      return { notMatching: true };
    }

    // Remove erro se as senhas coincidem
    formGroup.get('confirmPassword')?.setErrors(null);
    return null;
  }

  onRegister() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
      // Faça a requisição para o backend aqui
    }
  }

  onSkip() {
    // Ação para pular o registro opcional
    alert('Pulou registro dados adicionais');
  }
}
