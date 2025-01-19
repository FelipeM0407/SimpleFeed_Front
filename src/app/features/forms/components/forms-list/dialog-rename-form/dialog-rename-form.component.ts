import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-dialog-rename-form',
  templateUrl: './dialog-rename-form.component.html',
  styleUrls: ['./dialog-rename-form.component.scss'],
  standalone: true,
  imports: [NgIf, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule]
})
export class DialogRenameFormComponent {
  name = new FormControl('', [Validators.required, Validators.maxLength(100), Validators.minLength(5)]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { formName: string }, public dialog: MatDialog,
    private dialogRef: MatDialogRef<DialogRenameFormComponent>) {
    this.name.setValue(data.formName);
  }

  getErrorMessage() {
    if (this.name.hasError('required')) {
      return 'Insira um nome';
    }
    if (this.name.hasError('minlength')) {
      return 'Nome deve ter ao menos 5 caracteres';
    }
    return this.name.hasError('maxlength') ? 'Name cannot be more than 100 characters' : '';
  }

  saveForm(nameForm: any){
    this.dialogRef.close(nameForm)
  }
}
