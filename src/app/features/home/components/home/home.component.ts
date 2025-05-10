import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Chart } from 'chart.js';
import { HomeService } from '../../services/home.service';
import { AuthService } from 'src/app/core/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  novosFeedbacks = 0;
  totalFeedbacks = 0;
  respostasHoje = 0;
  formularioAtivos = 0;
  feedbacksUltimos30Dias: { label: string, value: number }[] = [];
  private clientDataSubscription: Subscription | null = null;
  clientId!: number;
  isMobile : boolean = false;


  constructor(private homeService: HomeService, private authService: AuthService) { 
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnInit(): void {

    this.clientDataSubscription = this.authService.getClientData().subscribe({
      next: (clientData) => {
        if (clientData) {

          this.clientId = clientData.id;
          this.homeService.getMetrics(this.clientId).subscribe((metrics) => {
            this.novosFeedbacks = metrics.newFeedbacksCount;
            this.totalFeedbacks = metrics.allFeedbacksCount;
            this.respostasHoje = metrics.todayFeedbacksCount;
            this.formularioAtivos = metrics.allActiveFormsCount;
            this.feedbacksUltimos30Dias = metrics.feedbacksCountLast30Days;

            this.atualizarGrafico();

          });
        }
      },
    });
  }

  get totalFeedbacksFormatado(): string {
    return this.formatarNumero(this.totalFeedbacks);
  }

  get respostasHojeFormatado(): string {
    return this.formatarNumero(this.respostasHoje);
  }

  get totalFormularioAtivos(): string {
    return this.formatarNumero(this.formularioAtivos);
  }

  formatarNumero(valor: number): string {
    return valor > 999 ? (valor / 1000).toFixed(1) + 'K' : valor.toString();
  }

  ngAfterViewInit(): void {
    const feedbacksPorDia = Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 100));
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dias = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return `${date.getDate()}/${meses[date.getMonth()]}`;
    });
  }

  atualizarGrafico(): void {
    const dias = this.feedbacksUltimos30Dias.map(x => x.label);
    const valores = this.feedbacksUltimos30Dias.map(x => x.value);

    new Chart('feedbackChart', {
      type: 'line',
      data: {
        labels: dias,
        datasets: [{
          label: 'Feedbacks por dia',
          data: valores,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.2)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: 'blue',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: !this.isMobile,
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              minRotation: 0,
              font: {
                size: this.isMobile ? 10 : 12
              }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: this.isMobile ? 10 : 12
              }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: this.isMobile ? 12 : 14
              }
            }
          }
        }
      }
    });
  }
}
