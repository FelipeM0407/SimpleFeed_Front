import { Component, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FeedbacksService } from '../services/feedbacks.service';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-filter-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatDatepickerModule, MatInputModule, MatNativeDateModule],
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ]
})
export class FilterDialogComponent {

  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FilterDialogComponent>,
    private dateAdapter: DateAdapter<any>,
    private feedbacksService: FeedbacksService, // Inject FeedbacksService
    @Inject(MAT_DIALOG_DATA) public data: { startDate: Date, endDate: Date } // Inject initial date range
  ) {
    this.dateAdapter.setLocale('pt-BR'); // Define o local para pt-BR
    this.filterForm = this.fb.group({
      dateRange: this.fb.group({
        startDate: [data.startDate || new Date(new Date().setDate(new Date().getDate() - 30))],
        endDate: [data.endDate || new Date()]
      })
    });
  }

  onSubmit() {
    if (this.filterForm.valid) {
      const filters = this.filterForm.value.dateRange;
      this.applyFilters(filters);
    }
  }

  applyFilters(dateRange: { startDate: Date, endDate: Date }) {
    const formId = 1; // Replace with the actual formId
    this.feedbacksService.applyFilters(formId, {
      start: dateRange.startDate,
      end: dateRange.endDate
    }).subscribe({
      next: (data) => {
        console.log('Filtros aplicados', data);
        this.dialogRef.close(data); // Close the dialog with the filtered data
      },
      error: (error) => {
        console.error('Erro ao aplicar filtros:', error);
      }
    });
  }

  clearFilters() {
    this.filterForm.reset(); // Reseta o formulário
  }
}
