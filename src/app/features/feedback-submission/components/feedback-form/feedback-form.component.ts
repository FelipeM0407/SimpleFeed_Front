import { Component } from '@angular/core';
import { FeedbackFormService } from '../../services/feedback-form.service';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsService } from 'src/app/features/forms/services/forms.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormField } from '../../models/FormField';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
  standalone: true,
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class FeedbackFormComponent {
  formId!: string;
  form: FormGroup = new FormGroup({});
  fields: FormField[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private feedbackFormService: FeedbackFormService,
    private formsService: FormsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.formId = params['formId'];

      const feedbackData = localStorage.getItem(this.formId);
      if (feedbackData) {
        const feedback = JSON.parse(feedbackData);
        const expirationDate = new Date(feedback.expiration);

        if (new Date() < expirationDate) {
          alert("Você já respondeu a este formulário hoje.");
          return;
        }
      }

      this.formsService.getFormStructure(parseInt(this.formId, 10)).subscribe({
        next: (data) => {
            this.fields = data.map((field: FormField) => {
            if (field.type === 'dropdown' && typeof field.options === 'string') {
              field.options = JSON.parse(field.options);
            }
            return field;
            }).sort((a: { ordenation: number; }, b: { ordenation: number; }) => a.ordenation - b.ordenation);
          this.createForm();
          this.isLoading = false;
        },
        error: (error) => {
          if (error.status === 403) {
            alert("Você já respondeu a este formulário hoje.");
          }
        }
      });
    });
  }

  createForm(): void {
    this.fields.forEach((field) => {
      let control: FormControl;
      if(field.name == 'data_do_envio'){
        return;
      }
      if (field.type === 'dropdown') {
        control = new FormControl(
          0, // Valor inicial "Selecione uma opção"
          field.required ? [Validators.required, this.validateDropdown] : null
        );
      } else {
        control = new FormControl(
          '', // Valor inicial vazio para outros campos
          field.required ? Validators.required : null
        );
      }

      this.form.addControl(field.name, control);
    });


  }

  validateDropdown(control: FormControl): { [key: string]: any } | null {
    return control.value === 0 ? { invalidDropdown: true } : null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert("Por favor, preencha todos os campos obrigatórios.");
    } else {
      alert("Formulário enviado com sucesso!");
    }
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
