import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActionLogResult } from '../../models/ActionLogResult ';
import { ActionLogsService } from '../../services/action-logs-service.service';
import { AuthService } from 'src/app/core/auth.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

@Component({
  selector: 'app-action-logs',
  standalone: true,
  providers: [DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ], imports: [
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './action-logs.component.html',
  styleUrls: ['./action-logs.component.scss']
})


export class ActionLogsComponent implements OnInit {
  displayedColumns: string[] = ['timestamp', 'action', 'description', 'observations'];
  dataSource = new MatTableDataSource<ActionLogResult>();

  @ViewChild('input') inputField!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filtros
  textFilter = new FormControl('');
  typeFilter = new FormControl<number[]>([]);
  startDateFilter = new FormControl<Date | null>(null);
  endDateFilter = new FormControl<Date | null>(null);
  clientId!: number;

  readonly actionTypeLabels = new Map<number, string>([
    [1, 'Criação de Formulário'],
    [2, 'Edição de Formulário'],
    [3, 'Ativação de Formulário'],
    [4, 'Inativação de Formulário'],
    // [5, 'Exclusão de Formulário'],
    // [6, 'Utilização de IA'],
    [7, 'Exclusão de Feedback'],
    [8, 'Duplicação de Formulário'],
    [9, 'Edição do Estilo do Formulário'],
    [10, 'Inativação de Formulário Agendada'],
    [11, 'Migração de Plano']
  ]);


  dateRangeForm: FormGroup;

  actionTypes = Array.from(this.actionTypeLabels.entries()).map(([value, label]) => ({
    name: label,
    value
  }));

  constructor(
    private actionLogsService: ActionLogsService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private fb: FormBuilder
  ) {
    this.clientId = this.authService.getClientId();
    this.dateRangeForm = this.fb.group({
      start: [null, Validators.required],
      end: [null, Validators.required]
    });
  }


  ngOnInit(): void {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    this.dateRangeForm.patchValue({
      start: trintaDiasAtras,
      end: hoje
    });

    this.applyFilters();
  }




  clearAllFilters(): void {
    this.typeFilter.reset();
    this.dateRangeForm.reset();
    this.inputField.nativeElement.value = '';
  }



  loadLogs(): void {

    const start = this.dateRangeForm.get('start')?.value;
    const endRaw = this.dateRangeForm.get('end')?.value;

    let end: Date | undefined = endRaw ? new Date(endRaw) : undefined;
    if (end) {
      end.setHours(23, 59, 59, 999);
    }


    this.actionLogsService.getLogs(
      this.clientId,
      this.typeFilter.value ?? [],
      start ?? undefined,
      end
    ).subscribe({
      next: (logs) => {
        this.dataSource.data = logs;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data, filter) =>
          Object.values(data)
            .join(' ')
            .toLowerCase()
            .includes(filter.trim().toLowerCase());
      },
      error: (err) => {
        console.error('Erro ao carregar logs', err);
      }
    });
  }

  clearDateFilter() {
    this.dateRangeForm.get('dateRange')?.reset();
    this.applyFilters();
  }

  applyTextFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  applyFilters() {
    this.loadLogs();
  }

  formatDate(dateStr: string): string {
    return this.datePipe.transform(dateStr, 'dd/MM/yyyy HH:mm') ?? '';
  }

  exportToExcel(): void {
    const dataToExport = this.dataSource.data.map((row: any) => {
      return {
        'Data': this.formatDate(row.timestamp),
        'Tipo de Ação': row.action,
        'Descrição': row.description,
        'Observações': row.observations
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Logs de Ação.xlsx');
  }
}
