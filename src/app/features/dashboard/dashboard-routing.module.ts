import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { authGuard } from 'src/app/core/auth.guard';
import { FeedbacksComponent } from '../feedbacks/feedback.component';
import { FormsListComponent } from '../forms/components/forms-list/forms-list.component';

const routes: Routes = [
  {
    path: '', component: DashboardComponent, // Rota padrão para o Dashboard
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'forms', pathMatch: 'full' }, // Rota padrão para 'forms'
      { path: 'forms', component: FormsListComponent },
      { path: 'feedbacks/:formId', component: FeedbacksComponent },
    ], // Aplica o guard na rota
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
