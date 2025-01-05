import { Component, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common'; // Import necessário
import { FormsService } from '../../services/forms.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatListModule } from '@angular/material/list';
import { FieldTypes } from '../../models/FieldTypes';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { FormsTemplates } from '../../models/FormsTemplates';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { FormStructure } from '../../models/FormStructure';

@Component({
  selector: 'app-form-create-dialog',
  templateUrl: './form-create-dialog.component.html',
  styleUrls: ['./form-create-dialog.component.scss'],
  standalone: true,
  imports: [MatRadioModule, MatCheckboxModule, FormsModule, MatButtonModule, MatTooltipModule, MatListModule, CommonModule, MatGridListModule, MatTabsModule, MatCardModule, MatIconModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule]
})
export class FormCreateDialogComponent {
  form: FormGroup;
  planUser: number = 1;
  formFields: FieldTypes[] = []; // Lista de campos retornados
  formTemplates: FormsTemplates[] = []; // Lista de campos retornados
  selectedTemplateId: number | null = null; // ID do template selecionado
  clientId: number | null = null;
  formStructure: FormStructure | null = null;

  constructor(
    public dialogRef: MatDialogRef<FormCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { formName: string },
    private fb: FormBuilder,
    private formsService: FormsService,
    private authService: AuthService,
    private el: ElementRef
  ) {
    this.form = this.fb.group({
      formName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]]
    });

    this.clientId = this.authService.getClientId();
  }

  ngOnInit(): void {
    const guidClient = this.authService.getUserGuid();

    this.formsService.getFormFieldsByClientId(guidClient).subscribe(fields => {
      this.formFields = fields.map(field => ({
        ...field,
        selected: false // Adiciona propriedade para controle de seleção
      }));
    });

    // Buscar templates
    this.formsService.getTemplatesByClientId(guidClient).subscribe(templates => {
      this.formTemplates = templates.map(template => ({
        ...template,
        selected: false // Adiciona propriedade para controle de seleção
      }));
    });
  }

  // Retorna os templates selecionados
  getSelectedTemplates(): FormsTemplates[] {
    return this.formTemplates.filter(template => template.id === this.selectedTemplateId);
  }

  selectTemplate(templateId: number): void {
    this.selectedTemplateId = templateId; // Define o ID do template selecionado
  }

  getIconByFieldType(fieldType: string): string {
    // Retorna o ícone baseado no tipo do campo
    switch (fieldType) {
      case 'email':
        return 'email';
      case 'textarea':
        return 'text_snippet';
      case 'dropdown':
        return 'arrow_drop_down_circle';
      case 'date':
        return 'event';
      case 'text':
        return 'short_text';
      case 'rating':
        return 'star';
      default:
        return 'help_outline'; // Ícone padrão
    }
  }

  cancel(): void {
    this.dialogRef.close(); // Fecha o diálogo sem ação
  }

  continue(): void {
    if (this.form.valid) {
      const selectedTemplate = this.getSelectedTemplates();

      const templateFields = selectedTemplate.map(template => {
        return JSON.parse(template.fields).map((field: any) => ({
          type: field.field_type,
          required: field.required,
          label: field.label,
          name: field.name,
          ordenation: field.ordenation,
          fieldTypeId: field.fieldTypeId,
          id: field.id
        }));
      });

      const selectedFields = this.formFields
        .filter(field => field.selected)
        .map((field, index) => ({
          type: field.fieldType,
          required: true,
          label: field.label,
          name: field.name,
          ordenation: index, 
          fieldTypeId: field.id,
          id: field.id
        }));


      this.formStructure = {
        name: this.form.value.formName,
        clientId: this.clientId || 0,
        isActive: true,
        templateId: selectedTemplate[0]?.id || 0,

        fields: selectedFields || templateFields
      };

      this.dialogRef.close({
        formName: this.form.value.formName,
        templates: selectedTemplate || null,
        fields: this.formStructure
      }); // Retorna o nome do formulário e os templates selecionados
    }
  }

  onTabChange(event: any) {
    this.clearSelections();
  }

  clearSelections() {
    this.selectedTemplateId = null;
    this.formFields.forEach(field => field.selected = false);
  }
  ngAfterViewInit(): void {
    // Aguarda as abas serem renderizadas e remove os botões
    const paginationButtons = this.el.nativeElement.querySelectorAll(
      '.mat-mdc-tab-header-pagination'
    );

    paginationButtons.forEach((button: HTMLElement) => {
      button.style.display = 'none'; // Esconde os botões
    });
  }

  canContinue(): boolean {
    const selectedFields = this.formFields.filter(field => field.selected);
    return this.form.valid && (selectedFields.length > 0 || this.selectedTemplateId !== null);
  }
}
