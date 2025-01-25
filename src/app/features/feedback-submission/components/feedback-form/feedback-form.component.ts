import { Component } from '@angular/core';
import { FeedbackFormService } from '../../services/feedback-form.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class FeedbackFormComponent {
  formId!: string;
  errorMessage: string | null = null;
  form: FormGroup | null = null;

  constructor(
    private route: ActivatedRoute,
    private feedbackFormService: FeedbackFormService
  ) { }


  ngOnInit(): void {

    this.route.params.subscribe((params) => {
      this.formId = params['formId'];

      const feedbackData = localStorage.getItem(this.formId);

      if (feedbackData) {
        const feedback = JSON.parse(feedbackData);
        const expirationDate = new Date(feedback.expiration);

        if (new Date() < expirationDate) {
          this.errorMessage = "Você já respondeu a este formulário hoje.";
          return;
        }
      }
      // Verificar acesso no backend
      // this.feedbackFormService.checkAccess(this.formId).subscribe({
      //   next: () => {
      //     this.loadForm();
      //   },
      //   error: (error: { message: string | null }) => {
      //     this.errorMessage = error.message;
      //   },
      // });
    });
  }

  loadForm(): void {
    this.feedbackFormService.loadForm(this.formId).subscribe({
      next: (data) => {
        // Renderize o formulário
        this.form = data;
      },
      error: (error) => {
        if (error.status === 403) {
          this.errorMessage = "Você já respondeu a este formulário hoje.";
        }
      }
    });
  }


  onSubmit(formValues: any) {
    this.feedbackFormService.submitFeedback(this.formId, formValues).subscribe({
      next: () => {
        // Feedback enviado com sucesso
        alert('Obrigado pelo seu feedback!');
      },
      error: (error: any) => {
        console.error('Erro ao enviar o feedback:', error);
      },
      complete: () => {
        // Operação completa
      }
    });
  }

  setLocalStorage(): void {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);

    const feedback = {
      formId: '1',
      expiration: expirationDate.toISOString()
    };

    localStorage.setItem(this.formId, JSON.stringify(feedback));
  }

}
