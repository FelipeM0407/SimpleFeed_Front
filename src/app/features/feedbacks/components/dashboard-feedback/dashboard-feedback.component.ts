import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-dashboard-feedback',
  standalone: true,
  templateUrl: './dashboard-feedback.component.html',
  styleUrls: ['./dashboard-feedback.component.scss'],
  imports: [CommonModule, NgChartsModule, MatCardModule]
})
export class DashboardFeedbackComponent implements OnChanges {
  @Input() feedbacks: any[] = [];
  @Input() dynamicColumns: { field_Id: string; label: string; type: string }[] = [];

  dashboards: any[] = [];

  // 1) Defina uma paleta maior de cores
  private colorPalette: string[] = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#8A2BE2', '#E6E6FA', '#7FFF00', '#FF7F50', '#DC143C', '#00FFFF',
    '#B8860B', '#A9A9A9', '#FF1493', '#BDB76B', '#FF8C00', '#FF00FF',
    '#808000', '#800080', '#663399', '#008080', '#FFD700', '#CD5C5C',
    '#6B8E23', '#E9967A', '#2F4F4F', '#008B8B', '#FFDEAD', '#F08080'
    // Adicione mais se necessário
  ];

  // Índice que aponta para a próxima cor livre da paleta
  private colorIndex = 0;

  constructor() {
    // 2) Embaralhe a paleta apenas uma vez no construtor (Fisher-Yates shuffle)
    //this.shuffleArray(this.colorPalette);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['feedbacks'] || changes['dynamicColumns']) {
      this.createDashboards();
    }
  }

  createDashboards(): void {
    this.dashboards = [];
    if (!this.feedbacks || !this.dynamicColumns) return;

    this.dynamicColumns.forEach(column => {
      if (column.type === 'rating' || column.type === 'dropdown') {
        const freqMap: { [key: string]: number } = {};

        this.feedbacks.forEach(feedback => {
          const answer = feedback.answers[column.field_Id];
          if (answer !== undefined && answer !== null && answer !== '') {
            freqMap[answer] = (freqMap[answer] || 0) + 1;
          }
        });

        if (Object.keys(freqMap).length > 0) {
          const labels = Object.keys(freqMap);
          const data = Object.values(freqMap);

          // 3) Monte um array de cores, consumindo da paleta embaralhada
          const backgroundColor: string[] = [];
          labels.forEach(() => {
            // Se chegar ao fim da paleta, você pode resetar ou tratar de outra forma
            if (this.colorIndex >= this.colorPalette.length) {
              this.colorIndex = 0; 
              // ou embaralhe novamente se preferir:
              // this.shuffleArray(this.colorPalette);
            }
            backgroundColor.push(this.colorPalette[this.colorIndex]);
            this.colorIndex++;
          });

          const chartData = {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: backgroundColor
            }]
          };

          const chartOptions: ChartConfiguration['options'] = {
            responsive: true,
            maintainAspectRatio: false
          };

          this.dashboards.push({
            title: column.label,
            chartType: 'pie',
            chartData: chartData,
            chartOptions: null
          });
          
        }
      }
    });
  }

  // Método auxiliar para embaralhar a paleta (Fisher-Yates shuffle)
  private shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
