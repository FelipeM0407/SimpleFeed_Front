import { Component } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [NgChartsModule]
})
export class DashboardComponent {
  public chartType: ChartType = 'bar'; // Pode ser 'line', 'doughnut', etc.
  public chartType2: ChartType = 'doughnut'; // Pode ser 'line', 'doughnut', etc.
  public chartType3: ChartType = 'line'; // Pode ser 'line', 'doughnut', etc.

  public chartData = {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio'],
    datasets: [
      { data: [10, 50, 20, 40, 60], label: 'Vendas', backgroundColor: 'blue' },
      { data: [5, 30, 15, 25, 45], label: 'Lucro', backgroundColor: 'green' }
    ]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true, // Responsivo para mobile
    maintainAspectRatio: false // Permite ajuste de altura
  };
}
