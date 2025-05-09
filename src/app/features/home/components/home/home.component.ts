import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  novosFeedbacks = 278;
  totalFeedbacks = 1532;
  respostasHoje = 98;

  get totalFeedbacksFormatado(): string {
    return this.formatarNumero(this.totalFeedbacks);
  }

  get respostasHojeFormatado(): string {
    return this.formatarNumero(this.respostasHoje);
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
    

    const isMobile = window.innerWidth <= 768;

    new Chart('feedbackChart', {
      type: 'line',
      data: {
        labels: dias,
        datasets: [{
          label: 'Feedbacks por dia',
          data: feedbacksPorDia,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: !isMobile,
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              minRotation: 0,
              font: {
                size: isMobile ? 10 : 12
              },
              callback: function(value, index) {
                return index % 3 === 0 ? dias[index] : '';
              }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: isMobile ? 10 : 12
              }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: isMobile ? 12 : 14
              }
            }
          }
        }
      }
    });
  }
}
