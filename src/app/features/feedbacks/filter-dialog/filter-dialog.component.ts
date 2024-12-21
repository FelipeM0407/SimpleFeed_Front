import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

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

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<FilterDialogComponent>,
    private dateAdapter: DateAdapter<any>
  ) {
    this.dateAdapter.setLocale('pt-BR'); // Define o local para pt-BR
    const today = new Date();
    this.filterForm = this.fb.group({
      dateRange: this.fb.group({
        startDate: [today],
        endDate: [today]
      })
    });
  }

  onSubmit() {
    if (this.filterForm.valid) {
      const filters = this.filterForm.value;
      console.log('Filtros aplicados:', filters);
      this.applyFilters();
    }
  }


  applyFilters() {
    console.log('Filtros aplicados');
  }

  clearFilters() {
    this.filterForm.reset(); // Reseta o formulário
    this.dialogRef.close();  // Fecha o modal
  }
}
