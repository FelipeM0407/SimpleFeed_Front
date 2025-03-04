import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          const token = response.token;
          localStorage.setItem('authToken', token); // Salva o token no LocalStorage

          this.router.navigate(['/dashboard']); // Redireciona para o Dashboard
        },
        error: (err) => {
          this.errorMessage = 'Usuário ou senha incorretos.';
          this.isLoading = false;
        }
      });
    }
  }


  goToRegister() {
    this.router.navigate(['/register']);
  }
}
