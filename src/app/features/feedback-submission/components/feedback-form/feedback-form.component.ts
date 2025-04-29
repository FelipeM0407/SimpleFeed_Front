import { Component, Inject, Renderer2 } from '@angular/core';
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
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { cpfValidator, telefoneValidator } from '../../../../shared/Util/validators';
import { ExpiredFormDialogComponent } from './expired-form-dialog/expired-form-dialog.component';

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
    MatProgressSpinnerModule,
    NgxMaskDirective
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask()
  ]
})
export class FeedbackFormComponent {
  formId!: string;
  form: FormGroup = new FormGroup({});
  fields: FormField[] = [];
  isLoading = true;
  client_id!: number;
  exibirForm: boolean = true;
  logoBase64: string = '';
  isPreview: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private feedbackFormService: FeedbackFormService,
    private formsService: FormsService,
    private dialog: MatDialog,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.renderer.setStyle(document.body, 'overflow', 'auto');

    this.route.params.subscribe((params) => {
      this.formId = params['formId'];
      this.isPreview = this.route.snapshot.queryParamMap.get('isPreview') === 'true';

      if (!this.isPreview) {
        // Nova chamada para buscar dados de configuração (incluindo expiration_date)
        this.formsService.getSettingsByFormIdAsync(parseInt(this.formId, 10)).subscribe(settings => {
          const expiration = settings?.expirationDate;

          if (expiration) {
            const expirationDate = new Date(expiration);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas a data

            if (expirationDate < today) {
              this.exibirForm = false;
              this.dialog.open(ExpiredFormDialogComponent, {
                width: '300px',
                panelClass: 'expired-form-dialog',
                disableClose: true
              });
              this.isLoading = false;
              return;
            }

          }

        });
      }

      this.formsService.getFormStructure(parseInt(this.formId, 10)).subscribe({
        next: (data) => {
          this.client_id = data[0].client_Id;
          this.fields = data.map((field: FormField) => {
            if ((field.type === 'dropdown' || field.type === 'multiple_selection') && typeof field.options === 'string') {
              if (field.options) {
                field.options = JSON.parse(field.options);
              }
            }
            return field;
          }).sort((a: { ordenation: number; }, b: { ordenation: number; }) => a.ordenation - b.ordenation);

          this.formsService.getLogoBase64ByFormId(parseInt(this.formId, 10)).subscribe((res: any) => {
            this.logoBase64 = res.logoBase64 || '';
          });

          this.createForm();
          this.isLoading = false;
        },
        error: (error) => {
          //Se ja respondeu e não é preview, exibe mensagem de erro
          if (error.status === 403 && !this.isPreview) {
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
          0,
          field.required ? [Validators.required, this.validateDropdown] : null
        );
      } else if (field.type === 'telephone') {
        control = new FormControl(
          '',
          field.required ? [Validators.required, telefoneValidator] : null
        );
      } else if (field.type === 'cpf') {
        control = new FormControl(
          '',
          field.required ? [Validators.required, cpfValidator] : null
        );
      } else if (field.type === 'multiple_selection') {
        control = new FormControl(
          [],
          field.required ? Validators.required : null
        );
      } else {
        control = new FormControl(
          '',
          field.required ? Validators.required : null
        );
      }

      this.form.addControl(field.id.toString(), control);
    });


  }

  validateDropdown(control: FormControl): { [key: string]: any } | null {
    return control.value === 0 ? { invalidDropdown: true } : null;
  }

  onSubmit(): void {

    if (!this.validateForm()) {
      this.form.markAllAsTouched();
    } else {
      if (this.isPreview) {
        return;
      }
      const formData = this.fields.map(field => ({
        value: this.processField(field),
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

  processField(field: FormField): string {
    const value = this.form.get(field.id.toString())?.value;

    if (field.name === 'data_do_envio') {
      return new Date().toLocaleDateString('pt-BR');
    }

    if (field.type === 'date') {
      return value ? new Date(value).toLocaleDateString('pt-BR') : '';
    }

    if (field.type === 'dropdown' && value === 0) {
      return '';
    }

    if (field.type === 'multiple_selection' && value.length === 0) {
      return '';
    }

    if (field.type === 'cpf') {
      return value ? value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '';
    }

    if (field.type === 'telephone') {
      return value ? value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : '';
    }

    return value;
  }

  validateForm(): boolean {
    let isValid = true;

    this.fields.forEach(field => {
      const control = this.form.get(field.id.toString());

      if (control) {
        if (field.required && (control.value === '' || (field.type === 'multiple_selection' && control.value.length === 0))) {
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
