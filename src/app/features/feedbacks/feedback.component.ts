import { Component, HostListener, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FormsService } from '../forms/services/forms.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select'; // Importação necessária
import { FeedbacksService } from './services/feedbacks.service';
import { MatBadgeModule } from '@angular/material/badge'; // Importação necessária
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DashboardFeedbackComponent } from './components/dashboard-feedback/dashboard-feedback.component';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSortModule } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { NgChartsModule } from 'ng2-charts';
import { MatMenuModule } from '@angular/material/menu';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { MatCardModule } from '@angular/material/card';
import { ReportsIA } from './models/ReportsIAs';
import { AuthService } from 'src/app/core/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { DetailReport } from './models/DetailReport';
import { ChangeDetectorRef } from '@angular/core';

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
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    CommonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatTabsModule,
    DashboardFeedbackComponent,
    MatSortModule,
    NgChartsModule,
    MatCardModule,
    MatDividerModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]

})
export class FeedbacksComponent implements OnInit {
  formId!: number;
  formName!: string;
  dynamicColumns: {
    id: number; name: string, field_Id: string; label: string; type: string; options: string[]
  }[] = [];
  displayedColumns: string[] = ['checkbox']; // checkbox primeiro
  dataSource = new MatTableDataSource<any>([]);
  isMobile = false;
  isLoading = true;
  loadingRelatorioIa = false;
  errorMessage!: string;
  selection = new SelectionModel<any>(true, []);
  dateRangeForm!: FormGroup;
  selectedCount = 0;
  selectedFeedback: any;
  today = new Date();
  chartFields: {
    label: string;
    name: string;
    type: string;
    chartLabels: string[];
    chartData: number[];
    chartDatasets: { label: string; data: number[]; backgroundColor: string[] }[];
  }[] = [];
  relatoriosIa: ReportsIA[] = [];
  relatoriosIaDataSource = new MatTableDataSource<ReportsIA>();
  relatoriosDisplayedColumns: string[] = ['createdAt', 'rangeDataSolicited', 'actions'];
  contextoNegocio: string = '';
  selectedRelatorioIa: any = null;
  contextoNegocioControl = new FormControl('', [Validators.required, Validators.minLength(15)]);


  @ViewChild('dialogNovoRelatorioIa') dialogNovoRelatorioIa!: TemplateRef<any>;
  @ViewChild('dialogVisualizarRelatorioIa') dialogVisualizarRelatorioIa!: TemplateRef<any>;



  chartColors: string[] = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#E7E9ED', '#76D7C4', '#F7DC6F', '#F1948A',
    '#85C1E9', '#BB8FCE', '#F8C471', '#82E0AA', '#F5B7B1'
  ];

  @ViewChild('picker') picker: any;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('filterDialog') filterDialogRef!: TemplateRef<any>;
  @ViewChild('confirmDialogRef') confirmDialogRef!: TemplateRef<any>;
  @ViewChild('viewDialogRef') viewDialogRef!: TemplateRef<any>;
  @ViewChild('mobileMenu') mobileMenu: any;
  @ViewChild('relatorioIaPaginator') relatorioIaPaginator!: MatPaginator;

  showDashboard: boolean = false;
  clientId: number;

  constructor(
    private route: ActivatedRoute,
    private feedbacksService: FeedbacksService,
    private formService: FormsService,
    private _liveAnnouncer: LiveAnnouncer,
    private _adapter: DateAdapter<any>,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.clientId = this.authService.getClientId();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.generateChartData();

  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 768;
    // this.cdr.detectChanges();
  }


  ngOnInit(): void {
    this.onResize();
    this.formId = Number(this.route.snapshot.paramMap.get('formId'));

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.dateRangeForm = this.fb.group({
      dateRange: this.fb.group({
        start: [thirtyDaysAgo],
        end: [today]
      })
    });

    this.formService.getFormStructure(this.formId).subscribe({
      next: (structure) => {
        this.formName = structure[0].formName;
        this.dynamicColumns = structure;
        this.displayedColumns = ['checkbox', ...this.dynamicColumns.map(f => `col_${f.id}`)];

        this.chartFields = this.dynamicColumns
          .filter(c => c.type === 'dropdown' || c.type === 'rating')
          .map(c => ({
            label: c.label,
            name: c.name,
            type: c.type,
            chartLabels: [],
            chartData: [],
            chartDatasets: [] // <-- aqui!
          }));



        this.fetchFilteredFeedbacks();
      },
      error: (error) => {
        console.error('Erro ao carregar a estrutura:', error);
        this.errorMessage = 'Erro ao carregar a estrutura.';
        this.isLoading = false;
      },
    });

    this.buscarRelatoriosIa();
  }

  generateChartData() {
    this.chartFields.forEach((field) => {
      const column = this.dynamicColumns.find(c => c.name === field.name);
      if (!column) return;

      const colKey = `col_${column.id}`;
      const counts: { [key: string]: number } = {};

      this.dataSource.data.forEach((row: any) => {
        const value = row[colKey];
        if (value !== undefined && value !== null && value !== '') {
          counts[value] = (counts[value] || 0) + 1;
        }
      });

      field.chartLabels = Object.keys(counts);
      field.chartData = Object.values(counts);

      field.chartDatasets = [{
        label: field.label,
        data: field.chartLabels.map(label => counts[label] || 0),
        backgroundColor: field.chartLabels.map((_, index) => this.chartColors[index % this.chartColors.length])
      }];
    });
  }

  fetchFilteredFeedbacks() {
    const range = this.dateRangeForm.value.dateRange;
    if (!range.start || !range.end) return;

    const start = new Date(range.start).toISOString();
    const end = new Date(range.end).toISOString();

    this.isLoading = true;

    this.feedbacksService.applyFilters(this.formId, {
      start,
      end
    }).subscribe({
      next: (feedbacks) => {
        const parsedFeedbacks = feedbacks.map((feedback: any) => {
          const answers = JSON.parse(feedback.answers);
          const answerMap: any = {};

          this.dynamicColumns.forEach(col => {
            const answer = answers.find((a: any) => a.id_form_field === col.field_Id || a.id_form_field === col.id);
            answerMap[`col_${col.id}`] = answer ? answer.value : '';
          });

          return {
            ...answerMap,
            submitted_At: feedback.submitted_At,
            id: feedback.id,
            isNew: feedback.isNew ?? false
          };

        });

        if (parsedFeedbacks.length > 0) {
          this.dataSource = new MatTableDataSource<any>(parsedFeedbacks);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.showDashboard = true; // <- adicione esta linha!

          this.generateChartData();
        } else {
          this.showDashboard = false; // <- adicione esta linha!
          this.dataSource = new MatTableDataSource<any>([]);
          this.chartFields.forEach(field => {
            field.chartLabels = [];
            field.chartData = [];
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao aplicar filtros:', error);
        this.errorMessage = 'Erro ao carregar os feedbacks filtrados.';
        this.isLoading = false;
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.dataSource.data);
    }
    this.updateSelectedCount(); // <- adicione esta linha!
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  clearDateFilter() {
    this.dateRangeForm.get('dateRange.start')?.setValue(null);
    this.dateRangeForm.get('dateRange.end')?.setValue(null);

    this.isLoading = true;

    this.feedbacksService.getFeedbacks(this.formId).subscribe({
      next: (feedbacks) => {
        const parsedFeedbacks = feedbacks.map((feedback: any) => {
          const answers = JSON.parse(feedback.answers);
          const answerMap: any = {};

          this.dynamicColumns.forEach(col => {
            const answer = answers.find((a: any) => a.id_form_field === col.field_Id || a.id_form_field === col.id);
            answerMap[`col_${col.id}`] = answer ? answer.value : '';
          });

          return {
            ...answerMap,
            submitted_At: feedback.submitted_At,
            id: feedback.id,
            isNew: feedback.isNew ?? false
          };

        });

        if (parsedFeedbacks.length > 0) {
          this.dataSource = new MatTableDataSource<any>(parsedFeedbacks);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.showDashboard = true;

          this.generateChartData();
        } else {
          this.showDashboard = false;
          this.dataSource = new MatTableDataSource<any>([]);
          this.chartFields.forEach(field => {
            field.chartLabels = [];
            field.chartData = [];
          });
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar feedbacks sem filtro:', error);
        this.errorMessage = 'Erro ao carregar os feedbacks.';
        this.isLoading = false;
      }
    });
  }

  openFilterDialog(): void {
    this.dialog.open(this.filterDialogRef);
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  updateSelectedCount(): void {
    this.selectedCount = this.selection.selected.length;
    this.selectedFeedback = this.selectedCount === 1 ? this.selection.selected[0] : null;
  }

  clearSelection(): void {
    this.selection.clear();
    this.updateSelectedCount();
  }

  deleteSelected(): void {
    const dialogRef = this.dialog.open(this.confirmDialogRef);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const ids = this.selection.selected.map(fb => fb.id);
        this.feedbacksService.deleteFeedbacks(ids).subscribe(() => {
          this.selection.clear();
          this.updateSelectedCount();
          this.snackBar.open('Feedbacks excluídos!', 'Fechar', { duration: 3000 });
          this.fetchFilteredFeedbacks();
        });
      }
    });
  }

  viewSelected(): void {
    if (this.selectedFeedback) {
      this.dialog.open(this.viewDialogRef);
    }
  }

  exportToExcel(): void {
    const dataToExport = this.dataSource.data.map((row: any) => {
      const exportRow: any = {};
      this.dynamicColumns.forEach(col => {
        exportRow[col.label] = row[`col_${col.id}`];
      });
      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedbacks');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Formulário_${this.formName.replace(/\s/g, '_')}.xlsx`);
  }

  abrirDialogGerarRelatorio() {
    this.contextoNegocioControl.reset();
    const isMobile = window.innerWidth <= 768;

    this.dialog.open(this.dialogNovoRelatorioIa, {
      maxWidth: isMobile ? '95vw' : '600px'
    });
  }

  gerarRelatorioIa() {

    if (this.contextoNegocioControl.invalid) return;
    const contexto = this.contextoNegocioControl.value;

    const dto = {
      clientId: this.clientId,
      formId: this.formId,
      dataInicio: this.dateRangeForm.value.dateRange.start,
      dataFim: this.dateRangeForm.value.dateRange.end,
      contextoNegocio: contexto || ''
    };

    this.loadingRelatorioIa = true;

    this.feedbacksService.generateIaReport(dto).subscribe({
      next: (res: DetailReport) => {
        this.snackBar.open('Relatório gerado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        this.buscarRelatoriosIa();
        this.dialog.closeAll();

        // Processar o relatório gerado e abrir a visualização
        this.selectedRelatorioIa = {
          createdAt: res.createdAt,
          range: res.rangeDataSolicited,
          ...JSON.parse(res.report)
        };
        this.loadingRelatorioIa = false;

        const isMobile = window.innerWidth <= 768;
        this.dialog.open(this.dialogVisualizarRelatorioIa, {
          maxWidth: isMobile ? '95vw' : '80vw'
        });
      },
      error: (error) => {
        this.snackBar.open('Erro ao gerar relatório.', '', { duration: 3000 });
        this.loadingRelatorioIa = false;
      }
    });
  }

  buscarRelatoriosIa() {

    this.feedbacksService
      .getReportsIa(this.formId, '', '')
      .subscribe({
        next: (response) => {
          this.relatoriosIa = response ?? [];
          this.relatoriosIaDataSource.data = this.relatoriosIa;
          this.relatoriosIaDataSource = new MatTableDataSource(this.relatoriosIa);
          this.relatoriosIaDataSource.paginator = this.relatorioIaPaginator;

        },
        error: (error) => {
          console.error('Erro ao buscar relatórios IA:', error);
          this.relatoriosIa = [];
          this.relatoriosIaDataSource.data = [];
        }
      });
  }


  visualizarRelatorioIa(id: number): void {
    const isMobile = window.innerWidth <= 768;
    this.feedbacksService.getReportIaById(id).subscribe((res) => {
      this.selectedRelatorioIa = {
        createdAt: res.createdAt,
        range: res.rangeDataSolicited,
        ...JSON.parse(res.report)
      };

      this.dialog.open(this.dialogVisualizarRelatorioIa, {
        maxWidth: isMobile ? '95vw' : '80vw'
      });
    });
  }


}


