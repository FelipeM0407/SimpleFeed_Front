import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { InvoiceService } from '../../../services/invoice.service';
import { Plan, PricingRule } from 'src/app/shared/Models/Plans';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-plan-details-dialog',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule, MatButtonModule, MatCardModule, MatIconModule, MatTableModule, MatTabsModule, MatDialogModule, CommonModule],
  templateUrl: './plan-details-dialog.component.html',
  styleUrls: ['./plan-details-dialog.component.scss']
})
export class PlanDetailsDialogComponent implements OnInit {
  plans: Plan[] = [];
  planoAtual: number = 0;
  showConfirmDialog = false;
  migratingPlan: any = null;
  loadingMigration = false;
  displayedColumns: string[] = ['item', 'unit_size', 'price'];
  clienteId: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { plans: Plan[]; planId: number },
    private invoiceService: InvoiceService,
    private dialogRef: MatDialogRef<PlanDetailsDialogComponent>,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.clienteId = this.authService.getClientId();
  }

  ngOnInit(): void {
    this.plans = this.data.plans;
    this.planoAtual = this.data.planId;
  }

  getPricingRules(planId: number): PricingRule[] {
    const plan = this.plans.find(p => p.id === planId);
    return plan?.pricing || [];
  }

  mapItemName(item: string): string {
    switch (item) {
      case 'form': return 'Formulário';
      case 'response_pack': return 'Pacote de Respostas';
      case 'ai_report': return 'Relatório de IA';
      default: return item;
    }
  }

  migrarParaPlano(plan: any): void {
    this.migratingPlan = plan;
    this.showConfirmDialog = true;
  }


  confirmarMigracao(): void {
    if (!this.migratingPlan) return;

    this.loadingMigration = true;

    this.invoiceService.migrarPlano(this.migratingPlan.id, this.clienteId).subscribe({
      next: () => {
        this.loadingMigration = false;
        this.showConfirmDialog = false;

        // Atualiza o plano atual na interface
        this.planoAtual = this.migratingPlan.id;

        // Feedback ao usuário
        this.snackBar.open('Plano migrado com sucesso!', 'Fechar', { duration: 3000 });

        // Atualiza a página
        window.location.reload();
      },
      error: (err: any) => {
        this.loadingMigration = false;
        this.snackBar.open('Erro ao migrar plano. Tente novamente.', 'Fechar', { duration: 4000 });
        console.error(err);
      }
    });
  }

}
