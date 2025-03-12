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

@Component({
  selector: 'app-form-edit',
  standalone: true,
  imports: [MatSnackBarModule, MatProgressSpinnerModule, MatSlideToggleModule, MatCardModule, MatButtonModule, MatMenuModule, MatTabsModule, MatIconModule, CommonModule, MatDialogModule],
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.scss'],
})
export class FormEditComponent {
  fields: { id: number; type: string; name: string; label: string; ordenation: number; required: boolean; options: string[]; fieldTypeId: number; isNew: boolean; isEmpty: boolean; hasFeedbacks: boolean }[] = [];
  iframeContent: SafeHtml = ''; // Usar SafeHtml para conteúdo sanitizado
  isMobile = false; // Define se é mobile
  activeTab = 0; // Tab ativa: 0 = Editor, 1 = Preview
  formFields: FieldTypes[] = []; // Lista de campos retornados
  hasFeedbacks: boolean = false;
  @ViewChild('confirmDialog', { static: true }) confirmDialog!: TemplateRef<any>;
  fieldsDeletedsWithFeedbacks: number[] = [];
  fieldsDeleteds: number[] = [];
  isLoading = true;

  constructor(private snackBar: MatSnackBar, private formsService: FormsService, private route: ActivatedRoute, private sanitizer: DomSanitizer,
    private authService: AuthService, private dialog: MatDialog,
    private router: Router) {

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
          this.updateIframe();
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
    this.updateIframe();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobile();
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

  // Atualiza o conteúdo do iframe
  updateIframe() {
    let formHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/@angular/material@16.0.0/prebuilt-themes/indigo-pink.css" rel="stylesheet">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.inputmask/5.0.7/inputmask.min.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function () {
                setTimeout(function() {
                    // Aplicando a máscara no CPF
                    let cpfInput = document.querySelector("#cpfField");
                    if (cpfInput) {
                        Inputmask("999.999.999-99").mask(cpfInput);
                    }

                    // Aplicando a máscara no celular
                    let phoneInput = document.querySelector("#phoneField");
                    if (phoneInput) {
                        Inputmask("(99) 99999-9999").mask(phoneInput);
                    }
                }, 500); // Pequeno delay para garantir que o DOM foi carregado
            });
        </script>

        <style>
          body {
            font-family: Roboto, Arial, sans-serif;
            padding: 20px;
            background: #333; /* Fundo escuro */
            display: flex;
            justify-content: center;
            align-items: flex-start !important; /* Mantém o formulário no topo */
            height: 100vh;
            overflow-y: auto; /* Habilita scroll vertical */
          }
            input, textarea, select {
            margin: 0;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box; /* Garante que o padding seja considerado no tamanho total */
            width: 100%; /* Garante que todos os elementos ocupem a largura total do container */
          }
          .form-container {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 80%;
          }
          .form-group {
            margin-bottom: 20px;
          }
          .rating {
          display: flex;
          flex-direction: row-reverse;
          justify-content: space-between;
          }
          .rating input {
            display: none;
          }
          .rating label {
            font-size: 4rem;
            font-size: ${this.isMobile ? '2rem' : '4rem'};
            color: #ccc;
            cursor: pointer;
            padding: 0 5px;
          }
          .rating input:checked ~ label {
            color: #f5b301;
          }
          .rating label:hover,
          .rating label:hover ~ label {
            color: #f5b301;
          }
          label {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
          }
          input, textarea, select {
            width: 100%;
            padding: 8px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          button {
            background-color: #3f51b5;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background-color: #303f9f;
          }

        </style>
      </head>
      <body>
        <div class="form-container">
          <form>
    `;

    // Adicionar somente os campos que não sejam "data_do_envio"
    this.fields
      .filter((field) => field.name !== 'data_do_envio') // Filtrar o campo `data_do_envio`
      .sort((a, b) => a.ordenation - b.ordenation) // Ordenar os campos pela ordenation
      .forEach((field) => {
        if (field.type === 'text' || field.type === 'email') {
          formHtml += `
        <div class="form-group">
          <label>${field.label}</label>
          <input type="${field.type}" ${field.required ? 'required' : ''}>
        </div>
        `;
        } else if (field.type === 'textarea') {
          formHtml += `
        <div class="form-group">
          <label>${field.label}</label>
          <textarea ${field.required ? 'required' : ''}></textarea>
        </div>
        `;
        } else if (field.type === 'cpf') {
          formHtml += `
              <div class="form-group">
                  <label>${field.label}</label>
                  <input type="text" id="cpfField" placeholder="000.000.000-00" ${field.required ? 'required' : ''}>
              </div>
          `;
        } else if (field.type === 'telephone') {
          formHtml += `
              <div class="form-group">
                  <label>${field.label}</label>
                  <input type="text" id="phoneField" placeholder="(00) 00000-0000" ${field.required ? 'required' : ''}>
              </div>
          `;
        } else if (field.type === 'date') {
          formHtml += `
        <div class="form-group">
          <label>${field.label}</label>
          <input type="date" ${field.required ? 'required' : ''}>
        </div>
        `;
        } else if (field.type === 'dropdown' && field.options) {
          formHtml += `
        <div class="form-group">
          <label>${field.label}</label>
          <select ${field.required ? 'required' : ''}>
          <option value="0">Selecione uma opção</option>
          ${field.options.map((option) => `<option value="${option}">${option}</option>`).join('')}
          </select>
        </div>
        `;
        } else if (field.type === 'rating') {
          formHtml += `
        <div class="form-group">
          <label>${field.label}</label>
          <div class="rating">
          ${Array.from({ length: 5 }, (_, i) => i + 1).reverse().map((i) => `
            <input type="radio" id="${field.name}-${i}" name="${field.name}" value="${i}" ${field.required ? 'required' : ''}>
            <label for="${field.name}-${i}">★</label>
          `).join('')}
          </div>
        </div>
        `;
        }
        else if (field.type === 'multiple_selection' && field.options) {
          formHtml += `
            <div class="form-group">
              <label>${field.label}</label>
              <div style="
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 8px;
              background: #fff;
              margin: 0 auto;
              ">
              ${field.options.map((option, index) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-bottom: 1px solid #eee;">
          <div style="flex: 1; text-align: left;">
            <input type="checkbox" id="${field.name}-${index}" name="${field.name}" value="${option}" ${field.required ? 'required' : ''}>
          </div>
          <div style="flex: 9; text-align: end;">
            <label for="${field.name}-${index}">${option}</label>
          </div>
          </div>
              `).join('')}
              </div>
            </div>
            `;
        }

      });

    formHtml += `
              <button>Enviar</button>
            </form>
          </div>
        </body>
        </html>
      `;

    // Sanitizar o conteúdo do iframe
    this.iframeContent = this.sanitizer.bypassSecurityTrustHtml(formHtml);
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
      this.updateIframe();
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
      this.updateIframe();
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
        this.updateIframe();
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
              this.updateIframe();
            }
          });
      } else {
        this.fieldsDeleteds.push(this.fields[realIndex].id);
        this.fields.splice(realIndex, 1);
        this.updateIframe();
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
    this.updateIframe();
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

      this.updateIframe();
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
        fieldsDeleteds: this.fieldsDeleteds
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


