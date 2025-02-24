import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { authGuard } from 'src/app/core/auth.guard';
import { FeedbacksComponent } from '../feedbacks/feedback.component';
import { FormsListComponent } from '../forms/components/forms-list/forms-list.component';
import { FormEditComponent } from '../forms/components/form-edit/form-edit.component';
import { AccountComponent } from '../account/account.component';

const routes: Routes = [
  {
    path: '', component: DashboardComponent, // Rota padrão para o Dashboard
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'forms', pathMatch: 'full' }, 
      { path: 'forms', component: FormsListComponent },
      { path: 'account', component: AccountComponent },
      { path: 'feedbacks/:formId', component: FeedbacksComponent },
      { path: 'form-edit/:formId', component: FormEditComponent }, 

    ], // Aplica o guard na rota
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
