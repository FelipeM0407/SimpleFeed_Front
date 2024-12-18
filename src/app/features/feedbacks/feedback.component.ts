import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeedbacksService } from '../forms/services/feedbacks.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  standalone: true,
  imports: [FormsModule, MatCheckboxModule, MatButtonModule, MatToolbarModule, MatIconModule, MatTableModule, CommonModule, MatProgressSpinnerModule, ]
})
export class FeedbacksComponent implements OnInit {
  formId!: number;
  feedbacks: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  dynamicColumns: string[] = [];
  displayedColumns: string[] = ['select', 'submittedAt'];


  constructor(
    private route: ActivatedRoute,
    private feedbacksService: FeedbacksService
  ) { }

  ngOnInit(): void {
    this.formId = Number(this.route.snapshot.paramMap.get('formId'));

    // Buscar os feedbacks
    this.feedbacksService.getFeedbacks(this.formId).subscribe({
      next: (data) => {
        this.feedbacks = data.map((item: any) => ({ ...item, selected: false })); // Adiciona a propriedade 'selected'

        if (data.length > 0) {
          this.dynamicColumns = Object.keys(data[0].answers);
          this.displayedColumns = ['select', 'submittedAt', ...this.dynamicColumns];
        }

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar os feedbacks.';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  // Método para selecionar ou desmarcar todos os checkboxes
  toggleSelectAll(event: any): void {
    const isChecked = event.checked;
    this.feedbacks.forEach(feedback => feedback.selected = isChecked);
  }
}


