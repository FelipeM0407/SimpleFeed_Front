import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PlanDetailsDialogComponent } from './plan-details-dialog/plan-details-dialog.component';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceDto } from '../../models/invoce-model';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { AuthService } from 'src/app/core/auth.service';
registerLocaleData(localePt, 'pt-BR');
import { Plans } from '../../../../shared/Enums/Plans';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTableModule, MatSelectModule, MatCardModule, CommonModule],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
})
export class InvoiceComponent implements OnInit {
  mesesDisponiveis: { valor: string, label: string }[] = [];
  mesSelecionado: string = '';

  // Simulação de dados — substitua por dados reais carregados via API
  plans: any = [/* planos vindos do backend */];
  pricingRules: any = [/* pricing_rules vindos do backend */];
  fatura?: InvoiceDto;
  clientId: number;
  carregandoPlanos: boolean = false;
  data: any;
  planIdSelecionado: any;

  constructor(private dialog: MatDialog, private invoiceService: InvoiceService, private authService: AuthService) {
    this.clientId = this.authService.getClientId();
  }

  ngOnInit() {
    this.gerarMeses();
    this.mesSelecionado = this.getMesAtual();
    this.buscarFatura();
    this.plans = this.data?.plans || [];
    this.planIdSelecionado = this.data?.planId || 0;
  }


  buscarFatura() {
    this.invoiceService.getFatura(this.clientId, this.mesSelecionado).subscribe(fatura => {
      this.fatura = fatura;

      if (!this.fatura) {
        this.dentroPlano = [
          { item: 'Formulários ativos', quantidade: '0', usado: '0' },
          { item: 'Respostas armazenadas', quantidade: '0', usado: '0' },
          { item: 'Relatórios com IA', quantidade: '0', usado: '0' }
        ];

        this.excedentes = [
          { item: 'Sem Plano', quantidade: 0, valor: 0 },
          { item: 'Sem Plano', quantidade: 0, valor: 0 },
          { item: 'Sem Plano', quantidade: 0, valor: 0 }
        ];
        return;
      }

      this.dentroPlano = [
        {
          item: 'Formulários ativos',
          quantidade: this.fatura.planId === Plans.SobDemanda ? 'Sem limite' : fatura.formsDentroPlano.toString(),
          usado: fatura.totalFormsMes.toString()
        },
        {
          item: 'Respostas armazenadas',
          quantidade: this.fatura.planId === Plans.SobDemanda ? 'Sem limite' : fatura.respostasDentroPlano.toString(),
          usado: fatura.totalRespostasArmazenadas.toString()
        },
        {
          item: 'Relatórios com IA',
          quantidade: this.fatura.planId === Plans.SobDemanda ? 'Sem limite' : fatura.aiReportsLimite.toString(),
          usado: fatura.totalAiReports.toString()
        }
      ];

      this.excedentes = [
        {
          item: this.fatura.planId === Plans.SobDemanda ? 'Formulários Sob Demanda' : 'Formulários excedentes',
          quantidade: fatura.formsExcedentes,
          valor: fatura.formExcessCharge
        },
        {
          item: this.fatura.planId === Plans.SobDemanda ? 'Respostas Sob Demanda' : 'Respostas excedentes',
          quantidade: fatura.respostasExcedentes,
          valor: fatura.responseExcessCharge
        },
        {
          item: this.fatura.planId === Plans.SobDemanda ? 'Relatórios com IA Sob Demanda' : 'Relatórios com IA excedentes',
          quantidade: fatura.extraAiReports,
          valor: fatura.aiReportExcessCharge
        }
      ];

    });
  }

  get statusFatura(): string {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    const [anoRef, mesRef] = this.mesSelecionado.split('-').map(Number);
    return (mesAtual === mesRef && anoAtual === anoRef) ? 'Fatura Aberta' : 'Fatura Fechada';
  }

  get statusFaturaClass(): string {
    return this.statusFatura === 'Fatura Aberta' ? 'aberta' : 'fechada';
  }



  gerarMeses() {
    const mesesPtBr = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const hoje = new Date();
    const meses: { valor: string; label: string }[] = [];

    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = (data.getMonth() + 1).toString().padStart(2, '0');
      const ano = data.getFullYear();
      const label = `${mesesPtBr[data.getMonth()]}/${ano}`;
      meses.push({
        valor: `${ano}-${mes}`,
        label
      });
    }

    this.mesesDisponiveis = meses;
  }

  getMesAtual(): string {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    return `${ano}-${mes}`;
  }

  abrirDialogDetalhesPlano(): void {
  this.invoiceService.getPlanosDisponiveis().subscribe({
    next: (plans) => {
      this.dialog.open(PlanDetailsDialogComponent, {
        width: '90%',
        data: {
          plans,
          planId: this.fatura?.planId
        }
      });
    },
    error: (err) => {
      console.error('Erro ao buscar planos disponíveis', err);
    }
  });
}



  onChangeMes(valor: string) {
    this.mesSelecionado = valor;
    this.buscarFatura();
  }


  displayedColumnsDentro: string[] = ['item', 'quantidade', 'usado'];
  dentroPlano = [
    { item: 'Formulários ativos', quantidade: '0', usado: '0' },
    { item: 'Respostas armazenadas', quantidade: '0', usado: '0' },
    { item: 'Relatórios com IA', quantidade: '0', usado: '0' }
  ];

  displayedColumnsExcedente: string[] = ['item', 'quantidade', 'valor'];

  excedentes = [
    { item: 'Formulários excedentes', quantidade: 0, valor: 0.00 },
    { item: 'Respostas excedentes', quantidade: 0, valor: 0.00 },
    { item: 'Relatórios com IA excedentes', quantidade: 0, valor: 0.00 }
  ];


  getTotalExcedente(): number {
    return this.excedentes.reduce((acc, curr) => acc + curr.valor, 0);
  }

}
