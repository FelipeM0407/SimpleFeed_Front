import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { FormsService } from '../../../services/forms.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
@Component({
  selector: 'app-dialog-rename-form',
  templateUrl: './dialog-rename-form.component.html',
  styleUrls: ['./dialog-rename-form.component.scss'],
  standalone: true,
  imports: [MatSlideToggleModule, NgIf, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule]
})
export class DialogRenameFormComponent {
  name = new FormControl('', [Validators.required, Validators.maxLength(100), Validators.minLength(5)]);
  formNames: string[] = [];
  title: string;
  isDuplicate = false;
  showQrField = false;
  qrCodeId: number = 0;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogRenameFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data?.title || 'Formulário';
    this.isDuplicate = data?.isDuplicate || false;

    this.form = this.fb.group({
      name: ['', Validators.required],
      enableQrCode: [false],
      manualFormId: [{ value: '', disabled: true }, []]
    });
  }

  ngOnInit(): void {
    // Habilita/desabilita o campo do QR Code dinamicamente
    this.form.get('enableQrCode')?.valueChanges.subscribe(enabled => {
      const qrControl = this.form.get('manualFormId');
      if (enabled) {
        qrControl?.setValidators([Validators.required]);
        qrControl?.enable();
      } else {
        qrControl?.clearValidators();
        qrControl?.setValue('');
        qrControl?.disable();
      }
      qrControl?.updateValueAndValidity();
    });
  }

  getErrorMessage() {
    if (this.name.hasError('required')) {
      return 'Insira um nome';
    }
    if (this.name.hasError('minlength')) {
      return 'Nome deve ter ao menos 5 caracteres';
    }
    if (this.name.hasError('alreadyExists')) {
      return 'Já existe um formulário com este nome';
    }
    return this.name.hasError('maxlength') ? 'Name cannot be more than 100 characters' : '';
  }

  saveForm(): void {
    const name = this.form.get('name')?.value?.trim();
    const enableQrCode = this.form.get('enableQrCode')?.value;
    const manualFormId = this.form.get('manualFormId')?.value;

    // Validação extra caso o campo esteja habilitado
    if (enableQrCode && (!manualFormId || manualFormId <= 0)) {
      this.form.get('manualFormId')?.setErrors({ required: true });
      return;
    }

    this.dialogRef.close({
      name,
      qrCodeId: enableQrCode ? manualFormId : 0
    });
  }

}
