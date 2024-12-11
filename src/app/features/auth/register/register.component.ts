import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
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
      console.log('Registro realizado com sucesso', this.registerForm.value);
      // Lógica para envio de dados ao backend
    } else {
      console.log('Formulário inválido');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
