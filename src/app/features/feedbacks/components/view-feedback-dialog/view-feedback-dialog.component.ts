import { Component, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-feedback-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './view-feedback-dialog.component.html',
  styleUrls: ['./view-feedback-dialog.component.scss']
})
export class ViewFeedbackDialogComponent {

  feedbackForm: FormGroup;
  labels: { [key: string]: string } = {};
  orderedKeys: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ViewFeedbackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.feedbackForm = this.fb.group({});
    for (const key in data.answers) {
      if (data.answers.hasOwnProperty(key)) {
        this.feedbackForm.addControl(key, this.fb.control({ value: data.answers[key], disabled: true }));
        const column = data.dynamicColumns.find((col: any) => col.field_Id === key);
        this.labels[key] = column ? column.label : key;
      }
    }
    this.orderedKeys = data.dynamicColumns.map((col: any) => col.field_Id);
  }

  close() {
    this.dialogRef.close();
  }
}
