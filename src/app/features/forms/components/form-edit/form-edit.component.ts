import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsService } from '../../services/forms.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HostListener } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'src/app/core/auth.service';
import { FieldTypes } from '../../models/FieldTypes';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { EditFieldDialogComponent } from './edit-field-dialog/edit-field-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TemplateRef } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarRef, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { forkJoin } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormPreviewComponent } from './form-preview/form-preview.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-form-edit',
  standalone: true,
  imports: [MatDatepickerModule, MatNativeDateModule, FormsModule, MatInputModule, MatFormFieldModule, FormPreviewComponent, MatTooltipModule, MatExpansionModule, MatSnackBarModule, MatProgressSpinnerModule, MatSlideToggleModule, MatCardModule, MatButtonModule, MatMenuModule, MatTabsModule, MatIconModule, CommonModule, MatDialogModule],
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD/MM/YYYY',
        },
        display: {
          dateInput: 'DD/MM/YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ]
})
export class FormEditComponent {
  fields: { id: number; type: string; name: string; label: string; ordenation: number; required: boolean; options: string[]; fieldTypeId: number; isNew: boolean; isEmpty: boolean; hasFeedbacks: boolean }[] = [];
  iframeContent: SafeHtml = ''; // Usar SafeHtml para conteúdo sanitizado
  isMobile = false; // Define se é mobile
  activeTab = 0; // Tab ativa: 0 = Editor, 1 = Preview
  formFields: FieldTypes[] = []; // Lista de campos retornados
  hasFeedbacks: boolean = false;
  @ViewChild('confirmDialog', { static: true }) confirmDialog!: TemplateRef<any>;
  @ViewChild('logoInput') logoInput!: any;
  fieldsDeletedsWithFeedbacks: number[] = [];
  fieldsDeleteds: number[] = [];
  isLoading = true;
  logoBase64: string = '';
  expirationDate: string = '';

  constructor(private snackBar: MatSnackBar, private formsService: FormsService, private route: ActivatedRoute, private sanitizer: DomSanitizer,
    private authService: AuthService, private dialog: MatDialog,
    private router: Router, private fb: FormBuilder,
    private dateAdapter: DateAdapter<Date>) {
      
    this.dateAdapter.setLocale('pt-BR');
    this.checkIfMobile();
  }

  ngOnInit() {

    const form_Id = this.route.snapshot.paramMap.get('formId');
    if (form_Id) {
      const numericFormId = +form_Id;

      // Valida se existem feedbacks associados a esse formulário
      this.formsService.validateExistenceFeedbacks(numericFormId).subscribe(res => {
        this.hasFeedbacks = res;

        this.formsService.getFormStructure(numericFormId).subscribe((form) => {
          this.fields = form
            .map((field: any) => ({
              ...field,
              options: field.options ? JSON.parse(field.options) : [],
              hasFeedbacks: this.hasFeedbacks, // Define hasFeedbacks para cada campo
              isNew: false
            })) // Converte options para um array usando JSON.parse
            .sort((a: { ordenation: number; }, b: { ordenation: number; }) => a.ordenation - b.ordenation); // Ordena os campos pela ordenation
        });
        this.formsService.getLogoBase64ByFormId(numericFormId).subscribe(response => {
          this.logoBase64 = response.logoBase64 || '';
        });

        this.isLoading = false;
      });
    }

    const guidClient = this.authService.getUserGuid();

    this.formsService.getFormFieldsByClientId(guidClient).subscribe(fields => {
      this.formFields = fields.map(field => ({
        ...field
      }));
    });
  }

  addField(field: FieldTypes) {
    let count = 2;
    let editedLabel = field.label;
    let editedName = '';

    while (this.fields.some(f => f.label === editedLabel)) {
      editedLabel = `${field.label} ${count}`;
      editedName = `${field.name}_${count}`;
      count++;
    }

    this.fields.push({
      id: field.id,
      type: field.fieldType,
      name: editedName || field.name,
      label: editedLabel || field.label,
      required: false,
      ordenation: field.ordenation,
      options: [],
      fieldTypeId: field.id,
      isNew: true,
      isEmpty: false,
      hasFeedbacks: false
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobile();
  }


  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }


  removerLogo(): void {
    if (confirm('Deseja realmente remover o logo?')) {
      this.logoBase64 = '';
      this.logoInput.nativeElement.value = '';
    }
  }




  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768; // Define como mobile para telas menores que 768px
    if (!this.isMobile) {
      this.activeTab = 0; // Sempre exibe o Editor em telas maiores
    }
  }

  get visibleFields() {
    return this.fields.filter((field) => field.name !== 'data_do_envio');
  }

  // Atualizar métodos de manipulação para filtrar `data_do_envio`
  moveUp(index: number) {
    // Obtenha o índice real no array `fields` com base no índice do array visível
    const visibleField = this.visibleFields[index];
    const realIndex = this.fields.findIndex((field) => field === visibleField);

    if (realIndex > 0) {
      // Troque os campos no array original
      [this.fields[realIndex - 1], this.fields[realIndex]] = [this.fields[realIndex], this.fields[realIndex - 1]];
      // Atualize a ordenation dos campos trocados
      this.fields[realIndex - 1].ordenation--;
      this.fields[realIndex].ordenation++;
    }
  }

  moveDown(index: number) {
    // Obtenha o índice real no array `fields` com base no índice do array visível
    const visibleField = this.visibleFields[index];
    const realIndex = this.fields.findIndex((field) => field === visibleField);

    if (realIndex < this.fields.length - 1) {
      // Troque os campos no array original
      [this.fields[realIndex + 1], this.fields[realIndex]] = [this.fields[realIndex], this.fields[realIndex + 1]];
      // Atualize a ordenation dos campos trocados
      this.fields[realIndex + 1].ordenation++;
      this.fields[realIndex].ordenation--;
    }
  }

  editField(index: number) {

    // Obtenha o índice real no array `fields` com base no índice do array visível
    const visibleField = this.visibleFields[index];
    const realIndex = this.fields.findIndex((field) => field === visibleField);

    const dialogRef = this.dialog.open(EditFieldDialogComponent, {
      width: '400px',
      data: { field: this.fields[realIndex], existingFields: this.fields }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fields[realIndex] = result;
        this.visibleFields.forEach(field => field.isEmpty = false);
      }
    });

  }

  // Ajustar a exclusão para não permitir excluir `data_do_envio`
  deleteField(index: number): void {
    const visibleField = this.visibleFields[index];
    const realIndex = this.fields.findIndex((field) => field === visibleField);

    if (this.fields[realIndex].name !== 'data_do_envio') {
      if (this.fields[realIndex].hasFeedbacks) {
        // Abra o diálogo de confirmação
        this.openConfirmDialog(this.confirmDialog, 'Excluir esse campo irá também excluir os feedbacks a ele associados. Tem certeza de que deseja excluí-lo?')
          .subscribe((confirmed) => {
            // Verifique explicitamente se o valor é igual a true
            if (String(confirmed) === 'true') {
              this.fieldsDeletedsWithFeedbacks.push(this.fields[realIndex].id);
              this.fields.splice(realIndex, 1);
            }
          });
      } else {
        this.fieldsDeleteds.push(this.fields[realIndex].id);
        this.fields.splice(realIndex, 1);
      }
    }
  }






  cancel() {
    this.router.navigate(['/dashboard/forms']);
  }

  chageSlide(fieldName: string, event: any) {
    const field = this.fields.find(field => field.name === fieldName);
    if (field) {
      field.required = event.checked;
    }
  }

  saveForm() {
    const selectEmptyFields = this.fields.filter(field => (field.type === 'dropdown' || field.type === 'multiple_selection') && field.options.length === 0);

    if (selectEmptyFields.length > 0) {

      this.visibleFields.forEach(field => {
        selectEmptyFields.find(selectField => selectField.name === field.name)?.
          options.length === 0 ?
          field.isEmpty = true :
          field.isEmpty = false;
      });
      return;
    }

    const form_Id = this.route.snapshot.paramMap.get('formId');
    if (form_Id) {
      const numericFormId = +form_Id;
      const editFormDto = {
        FormId: numericFormId,
        Fields: this.fields.map((field, index) => ({
          Id: field.id,
          Type: field.type,
          Required: field.required,
          Label: field.label,
          Name: field.name,
          Ordenation: index,
          Options: field.options.length ? JSON.stringify(field.options) : null,
          Field_Type_Id: field.id,
          IsNew: field.isNew
        })),
        fieldsDeletedsWithFeedbacks: this.fieldsDeletedsWithFeedbacks,
        fieldsDeleteds: this.fieldsDeleteds,
        logoBase64: this.logoBase64,
        expirationDate: this.expirationDate
      };

      this.isLoading = true;

      this.formsService.saveFormEdits(editFormDto).subscribe((success: any) => {
        if (success.success) {
          this.snackBar.open('Formulário Salvo com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

          this.router.navigate(['/dashboard/forms']);
        } else {
          this.snackBar.open('Erro ao salvar formulário!', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
        this.isLoading = false;

      }, (error) => {
        alert('Ocorreu um erro ao salvar o formulário');
      });
    }
  }


  openConfirmDialog(templateRef: TemplateRef<any>, message: string): Observable<boolean> {
    const dialogRef = this.dialog.open(templateRef, {
      data: { message },
      width: '300px',
    });

    return dialogRef.afterClosed(); // Retorna o resultado do diálogo
  }


}


