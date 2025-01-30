import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { FormsService } from '../../../services/forms.service';

@Component({
  selector: 'app-dialog-rename-form',
  templateUrl: './dialog-rename-form.component.html',
  styleUrls: ['./dialog-rename-form.component.scss'],
  standalone: true,
  imports: [NgIf, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule]
})
export class DialogRenameFormComponent {
  name = new FormControl('', [Validators.required, Validators.maxLength(100), Validators.minLength(5)]);
  formNames: string[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: { formName: string }, public dialog: MatDialog,
    private formsService: FormsService,
    private dialogRef: MatDialogRef<DialogRenameFormComponent>) {
    this.name.setValue(data.formName);
    this.formNames = this.formsService.formNames;
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

  saveForm(nameForm: any) {
    if (this.name.value && this.formNames.includes(this.name.value)) {
      // seta um erro do tipo alreadyExists
      this.name.setErrors({ alreadyExists: true });
      return;
    }
    this.dialogRef.close(nameForm);
  }
}
