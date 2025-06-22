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
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormPreviewComponent } from './form-preview/form-preview.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';
import { FormSettings } from '../../models/FormSettings';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormStyleDto } from '../../models/FormStyleDto';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { QrCodeCustomComponent } from '../../../forms/components/forms-list/qr-code-custom/qr-code-custom.component';
import { FormQRCode } from '../../models/FormQRCode';


@Component({
  selector: 'app-form-edit',
  standalone: true,
  imports: [QrCodeCustomComponent, ReactiveFormsModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, FormsModule, MatInputModule, MatFormFieldModule, FormPreviewComponent, MatTooltipModule, MatExpansionModule, MatSnackBarModule, MatProgressSpinnerModule, MatSlideToggleModule, MatCardModule, MatButtonModule, MatMenuModule, MatTabsModule, MatIconModule, CommonModule, MatDialogModule],
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
  qrcode_logo_Base64: string = '';
  checkboxDataInativacao: boolean = false;
  settingsForm: FormSettings = {
    inativationDate: undefined
  };
  qrCodeUrl: string | null = null;
  formName!: string;
  form_Id!: number;
  saveTrigger$ = new Subject<void>();
  reloadKey = Date.now();
  formStyle: FormStyleDto = {
    formId: 0,
    color: '',
    colorButton: '',
    backgroundColor: '',
    fontColor: '',
    fontFamily: '',
    fontSize: '',
    colorTextButton: ''
  };

  qrCodeColor: string = '#000000';
  qrCodeTempLogo: string | null = '';
  qrCodeAlterado = false;
  logoRemovido = false;



  availableFonts: string[] = [
    'Roboto', 'Segoe UI', 'Arial', 'Helvetica', 'Georgia', 'Tahoma', 'Verdana', 'Courier New', 'Times New Roman'
  ];
  styleForm!: FormGroup;
  hasEmptyFields: boolean = false;

  resetFormStyle() {
    this.formStyle.backgroundColor = '#1f1f43';
    this.formStyle.fontColor = '#000000';
    this.formStyle.fontFamily = 'Roboto';
    this.formStyle.fontSize = '16';
    this.formStyle.color = '#ffffff';
    this.formStyle.colorButton = '#20b2aa';
    this.formStyle.colorTextButton = '#000000';
  }

  constructor(private snackBar: MatSnackBar, private formsService: FormsService, private route: ActivatedRoute, private sanitizer: DomSanitizer,
    private authService: AuthService, private dialog: MatDialog,
    private router: Router, private fb: FormBuilder,
    private dateAdapter: DateAdapter<Date>) {

    this.dateAdapter.setLocale('pt-BR');
    this.checkIfMobile();
  }

  ngOnInit() {

    this.saveTrigger$
      .pipe(debounceTime(500)) // espera 500ms depois da última alteração
      .subscribe(() => {
        this.saveForm();
      });


    this.form_Id = Number(this.route.snapshot.paramMap.get('formId'));
    if (this.form_Id) {
      const numericFormId = +this.form_Id;

      // Valida se existem feedbacks associados a esse formulário
      this.formsService.validateExistenceFeedbacks(numericFormId).subscribe(res => {
        this.hasFeedbacks = res;

        this.formsService.getFormStructure(numericFormId).subscribe((form) => {
          const existingNames = new Set<string>();

          this.fields = form.map((field: any, index: number) => {
            let parsedOptions = field.options ? JSON.parse(field.options) : [];
            let uniqueName = field.name;
            let count = 2;

            // Garante que o campo "name" seja único
            while (existingNames.has(uniqueName)) {
              uniqueName = `${field.name}_${count++}`;
            }
            existingNames.add(uniqueName);

            return {
              ...field,
              name: uniqueName,
              options: parsedOptions,
              hasFeedbacks: this.hasFeedbacks,
              isNew: false
            };
          }).sort((a: any, b: any) => a.ordenation - b.ordenation);

          this.formName = form[0].formName;
        });


        this.formsService.getLogoBase64ByFormId(numericFormId).subscribe(response => {
          this.logoBase64 = response.logoBase64 || '';
        });

        this.formsService.getLogoBase64ByQrCode(numericFormId).subscribe({
          next: (formQRCode: FormQRCode) => {
            if (formQRCode) {
              this.qrcode_logo_Base64 = formQRCode.qrCodeLogoBase64 || '';
              this.qrCodeTempLogo = this.qrcode_logo_Base64;
            }

            const frontUrl = this.formsService.getFrontUrl();
            const url = `${frontUrl}/feedback-submission/${numericFormId}`;
            this.qrCodeUrl = url;
            this.qrCodeColor = formQRCode.color || '#000000';
          },
          error: () => {
            console.error('Erro ao buscar o FormQRCode');
          }
        });

        this.formsService.getSettingsByFormIdAsync(numericFormId).subscribe(response => {
          this.settingsForm = response || { inativationDate: undefined };
          if (this.settingsForm?.inativationDate) {
            this.checkboxDataInativacao = true;
          }
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

    this.loadFormStyle();
  }

  triggerSave() {
    this.saveTrigger$.next();
  }

  checkEmptyFields() {
    this.hasEmptyFields = this.visibleFields.some(field => field.isEmpty);
  }

  ngDoCheck() {
    this.checkEmptyFields();
  }


  addField(field: FieldTypes) {
    let editedLabel = field.label;
    let editedName = field.name;
    let count = 2;

    // Garante que o name seja único
    while (this.fields.some(f => f.name === editedName)) {
      editedName = `${field.name}_${count}`;
      count++;
    }


    this.fields.push({
      id: field.id,
      type: field.fieldType,
      name: editedName,
      label: editedLabel || field.label,
      required: false,
      ordenation: field.ordenation,
      options: [],
      fieldTypeId: field.id,
      isNew: true,
      isEmpty: false,
      hasFeedbacks: false
    });
    this.triggerSave();
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
      this.triggerSave()
    };
    reader.readAsDataURL(file);
  }


  removerLogo(): void {
    if (confirm('Deseja realmente remover o logo?')) {
      this.qrcode_logo_Base64 = '';
      this.logoInput.nativeElement.value = '';
      this.triggerSave()
    }
  }

  habilitaDataInativacao(event: any): void {
    this.checkboxDataInativacao = event.checked;

    if (!event.checked) {
      if (this.settingsForm) {
        this.settingsForm.inativationDate = undefined;
      }
      this.triggerSave();
    }
  }

  onDateChange() {
    this.triggerSave();
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
    this.triggerSave();
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
    this.triggerSave();
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
        this.triggerSave();
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
              this.triggerSave();
            }
          });
      } else {
        this.fieldsDeleteds.push(this.fields[realIndex].id);
        this.fields.splice(realIndex, 1);
        this.triggerSave();
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
    this.triggerSave();
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

      if (this.checkboxDataInativacao && !this.settingsForm?.inativationDate) {
        this.snackBar.open('Por favor, selecione uma data de inativação.', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return;
      }

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
        inativationDate: this.settingsForm?.inativationDate,
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

          this.formsService.getFormStructure(numericFormId).subscribe((form) => {
            this.fields = form
              .map((field: any) => ({
                ...field,
                options: field.options ? JSON.parse(field.options) : [],
                hasFeedbacks: this.hasFeedbacks, // Define hasFeedbacks para cada campo
                isNew: false
              })) // Converte options para um array usando JSON.parse
              .sort((a: { ordenation: number; }, b: { ordenation: number; }) => a.ordenation - b.ordenation); // Ordena os campos pela ordenation
            this.formName = form[0].formName;
          });

          this.fieldsDeleteds = [];
          this.fieldsDeletedsWithFeedbacks = [];


          this.reloadKey = Date.now();
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

  loadFormStyle() {

    this.formsService.getFormStyle(this.form_Id).subscribe((style) => {
      if (style) {
        this.formStyle = style;
        this.styleForm.patchValue({ fontSize: style.fontSize });
      } else {
        this.resetFormStyle();
      }
    });

    this.styleForm = this.fb.group({
      fontSize: [this.formStyle.fontSize || 16, [Validators.required, Validators.min(10), Validators.max(25)]],
      // outros campos podem ser adicionados aqui também
    });
  }

  saveFormStyle() {

    this.formStyle.fontSize = this.styleForm.get('fontSize')?.value;
    this.formsService.saveFormStyle(this.form_Id, this.formStyle).subscribe(() => {
      this.snackBar.open('Estilo Salvo com sucesso!🎨', 'Fechar', {
        duration: 3000,
        panelClass: ['snackbar-success'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });

      //Atualiza o iframe
      this.reloadKey = Date.now();
    });
  }

  onQrLogoUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 500 * 1024;
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e: any) => {
      img.onload = () => {
        if (img.width > 300 || img.height > 300) {
          alert('A imagem deve ter no máximo 300x300 pixels.');
          return;
        }

        if (file.size > maxSize) {
          alert('A imagem deve ter no máximo 500KB.');
          return;
        }

        this.qrCodeTempLogo = e.target.result;
        this.logoRemovido = false;
        this.qrCodeAlterado = true;
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  openColorPicker(): void {
    // Aqui você pode implementar um mat-dialog para escolher a cor ou integrar com o componente existente.
    console.log('Abrir seletor de cor');
  }

  salvarQrCode(): void {
    const payload = {
      formId: this.form_Id,
      qrCodeLogoBase64: this.logoRemovido ? null : this.qrCodeTempLogo,
      color: this.qrCodeColor
    };

    this.formsService.saveQrCodeData(payload).subscribe({
      next: () => {
        this.qrcode_logo_Base64 = this.logoRemovido ? '' : (this.qrCodeTempLogo || '');
        this.qrCodeAlterado = false;
        this.logoRemovido = false;
        this.snackBar.open('QR Code Salvo com sucesso!🎨', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: () => alert('Erro ao salvar QR Code.')
    });
  }

  onQrCodeChanged(): void {
    this.qrCodeAlterado = true;
  }

  onLogoRemovePending(): void {
    if (confirm('Deseja realmente remover o logo do QR Code?')) {
      this.qrCodeTempLogo = null; // remove da visualização temporária
      this.logoRemovido = true;
      this.qrCodeAlterado = true;
    }
  }



}


