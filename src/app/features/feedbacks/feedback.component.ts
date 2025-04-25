import { Component, HostListener, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
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
    MatSortModule
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
  displayedColumns: string[] = ['select']; // checkbox primeiro
  dataSource = new MatTableDataSource<any>([]);
  isMobile = false;
  isLoading = true;
  errorMessage!: string;
  selection = new SelectionModel<any>(true, []);
  dateRangeForm!: FormGroup;
  selectedCount = 0;
  selectedFeedback: any;
  today = new Date();


  @ViewChild('picker') picker: any;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('filterDialog') filterDialogRef!: TemplateRef<any>;
  @ViewChild('confirmDialogRef') confirmDialogRef!: TemplateRef<any>;
  @ViewChild('viewDialogRef') viewDialogRef!: TemplateRef<any>;
  
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
  ) {

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 768;
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
        this.displayedColumns = ['select', ...this.dynamicColumns.map(f => f.name)];

        // Aplica o filtro logo que carregar a tela
        this.fetchFilteredFeedbacks();
      },
      error: (error) => {
        console.error('Erro ao carregar a estrutura:', error);
        this.errorMessage = 'Erro ao carregar a estrutura.';
        this.isLoading = false;
      },
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
            answerMap[col.name] = answer ? answer.value : '';
          });

          return {
            ...answerMap,
            submitted_At: feedback.submitted_At,
            id: feedback.id,
            isNew: feedback.isNew ?? false
          };
          
        });

        this.dataSource = new MatTableDataSource<any>(parsedFeedbacks);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
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
            answerMap[col.name] = answer ? answer.value : '';
          });

          return {
            ...answerMap,
            submitted_At: feedback.submitted_At,
            id: feedback.id,
            isNew: feedback.isNew ?? false
          };
          
        });

        this.dataSource = new MatTableDataSource<any>(parsedFeedbacks);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
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
}


