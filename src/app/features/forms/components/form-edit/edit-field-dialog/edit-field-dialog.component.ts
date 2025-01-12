import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
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
  @ViewChild('optionsContainer') optionsContainer!: ElementRef<HTMLDivElement>;

  // Maximum number of options allowed
  maxOptions = 10;

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
    if (this.options.length < this.maxOptions) {
      this.options.push(this.fb.control(''));
    
      // Certifique-se de que o scroll ocorre após o novo elemento ser renderizado
      setTimeout(() => {
        if (this.optionsContainer) {
          this.optionsContainer.nativeElement.scrollTop = this.optionsContainer.nativeElement.scrollHeight;
        }
      });
    }
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

  isAddOptionDisabled() {
    return this.options.length >= this.maxOptions;
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
