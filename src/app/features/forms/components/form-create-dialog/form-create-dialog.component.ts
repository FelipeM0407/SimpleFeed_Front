import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms'; 
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common'; // Import necessário


@Component({
  selector: 'app-form-create-dialog',
  templateUrl: './form-create-dialog.component.html',
  styleUrls: ['./form-create-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatTabsModule, MatCardModule, MatIconModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule]
})
export class FormCreateDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FormCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { formName: string },
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      formName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]]
    });
  }

  cancel(): void {
    this.dialogRef.close(); // Fecha o diálogo sem ação
  }

  continue(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.formName); // Retorna o nome do formulário
    }
  }

}
