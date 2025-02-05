import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { SuccessDialogComponent } from './components/success-dialog/success-dialog.component'; 
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';




@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    SuccessDialogComponent,
    SuccessDialogComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgxMaskDirective,
    HttpClientModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  providers: [provideNgxMask()] // Configure o provedor para máscaras

})
export class AuthModule { }
