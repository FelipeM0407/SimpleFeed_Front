import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-field-dialog',
  templateUrl: './edit-field-dialog.component.html',
  styleUrls: ['./edit-field-dialog.component.scss'],
  standalone: true,
  imports: [MatInputModule, CommonModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule]
})
export class EditFieldDialogComponent {
  fieldForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditFieldDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.fieldForm = this.fb.group({
      label: [data.field.label, Validators.required],
      options: this.fb.array(data.field.options || [])
    });
  }

  get options() {
    return this.fieldForm.get('options') as FormArray;
  }

  addOption() {
    this.options.push(this.fb.control(''));
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  moveOptionUp(index: number) {
    if (index > 0) {
      const option = this.options.at(index);
      this.options.removeAt(index);
      this.options.insert(index - 1, option);
    }
  }

  moveOptionDown(index: number) {
    if (index < this.options.length - 1) {
      const option = this.options.at(index);
      this.options.removeAt(index);
      this.options.insert(index + 1, option);
    }
  }

  onSave() {
    const updatedField = {
      ...this.data.field,
      label: this.fieldForm.value.label,
      options: this.fieldForm.value.options
    };
    this.dialogRef.close(updatedField);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
