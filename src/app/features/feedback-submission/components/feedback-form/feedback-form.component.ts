import { Component, Inject } from '@angular/core';
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
import { DateAdapter, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormField } from '../../models/FormField';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ThankYouDialogComponent } from './thank-you-dialog/thank-you-dialog/thank-you-dialog.component';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ]
})
export class FeedbackFormComponent {
  formId!: string;
  form: FormGroup = new FormGroup({});
  fields: FormField[] = [];
  isLoading = true;
  client_id!: number;
  exibirForm: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private feedbackFormService: FeedbackFormService,
    private formsService: FormsService,
    private dialog: MatDialog,
    @Inject(MAT_DATE_LOCALE) private _locale: string
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.formId = params['formId'];

      const feedbackData = localStorage.getItem(this.formId);
      if (feedbackData) {
        const feedback = JSON.parse(feedbackData);
        const expirationDate = new Date(feedback.expiration);

        if (new Date() < expirationDate) {
          this.exibirForm = false;
          this.dialog.open(ThankYouDialogComponent, {
            width: '300px',
            panelClass: 'thank-you-dialog',
            disableClose: true
          });
          this.isLoading = false;
          return;
        }
      }

      this.formsService.getFormStructure(parseInt(this.formId, 10)).subscribe({
        next: (data) => {
          this.client_id = data[0].client_Id;
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
      if (field.name == 'data_do_envio') {
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

    if (!this.validateForm()) {
      this.form.markAllAsTouched();
    } else {
      const formData = this.fields.map(field => ({
        value: field.name === 'data_do_envio'
          ? new Date().toLocaleDateString('pt-BR')
          : field.type === 'date'
            ? this.form.get(field.name)?.value ? new Date(this.form.get(field.name)?.value).toLocaleDateString('pt-BR') : ''
            : field.type === 'dropdown' && this.form.get(field.name)?.value === 0
              ? ''
              : this.form.get(field.name)?.value,
        id_form_field: field.id
      }));

      const submissionData = {
        client_id: this.client_id,
        form_id: parseInt(this.formId, 10),
        answers: formData,
        is_new: true
      };

      //So salvar no local storage se a requisição for bem sucedida
      this.feedbackFormService.submitFeedback(submissionData).subscribe({
        next: () => {
          this.setLocalStorage();
        },
        complete: () => {
          this.exibirForm = false;
        }
      });

      this.dialog.open(ThankYouDialogComponent, {
        width: '300px',
        panelClass: 'thank-you-dialog',
        disableClose: true
      });
    }
  }

  validateForm(): boolean {
    let isValid = true;

    this.fields.forEach(field => {
      const control = this.form.get(field.name);

      if (control) {
        if (field.required && control.value === '') {
          control.setErrors({ required: true });
          isValid = false;
        }

        if (field.type === 'email' && control.value !== '' && !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i.test(control.value)) {
          control.setErrors({ email: true });
          isValid = false;
        }

        if (field.type === 'date' && control.value !== '' && isNaN(Date.parse(control.value))) {
          control.setErrors({ date: true });
          isValid = false;
        }
      }
    });

    return isValid;
  }

  setLocalStorage(): void {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);

    const feedback = {
      formId: this.formId,
      expiration: expirationDate.toISOString()
    };

    localStorage.setItem(this.formId, JSON.stringify(feedback));
  }
}
