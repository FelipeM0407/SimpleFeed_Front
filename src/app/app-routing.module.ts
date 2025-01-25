import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { FeedbackFormComponent } from './features/feedback-submission/components/feedback-form/feedback-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', loadChildren: () => 
    import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [authGuard] },
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule), // Certifique-se do caminho correto para o módulo AuthModule
  },
  {
    path: 'feedback-submission/:formId', // Registra a rota diretamente
    component: FeedbackFormComponent,
  },
  { path: '**', redirectTo: 'login' },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
