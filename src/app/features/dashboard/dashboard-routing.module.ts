import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { authGuard } from 'src/app/core/auth.guard';

const routes: Routes = [
  { path: '', component: DashboardComponent, // Rota padrão para o Dashboard
    canActivate: [authGuard] // Aplica o guard na rota
   },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
