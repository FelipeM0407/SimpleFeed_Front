import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FormsService } from '../forms/services/forms.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogComponent } from './components/filter-dialog/filter-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select'; // Importação necessária
import { FeedbacksService } from './services/feedbacks.service';
import { ViewFeedbackDialogComponent } from './components/view-feedback-dialog/view-feedback-dialog.component';
import { MatBadgeModule } from '@angular/material/badge'; // Importação necessária
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSnackBarModule
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ]
})
export class FeedbacksComponent implements OnInit {
  formId!: number;
  feedbacks: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  dynamicColumns: { field_Id: string; label: string; type: string; options: string[] }[] = [];
  displayedColumns: string[] = ['select'];
  selectedCount = 0; // Quantidade de registros selecionados
  isMobile = false;

  @ViewChild(MatSort) sort: MatSort | undefined; // ViewChild para o MatSort
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined; // ViewChild para o MatPaginator

  feedbacksSorted: MatTableDataSource<any> = new MatTableDataSource<any>();

  filterForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private feedbacksService: FeedbacksService,
    private formService: FormsService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    @Inject(MAT_DATE_LOCALE) private _locale: string
  ) {
    this.filterForm = this.fb.group({
      data_do_feedback: this.fb.group({
        start: [''],
        end: ['']
      })
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 768; // Detecta se é tela mobile
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 768; // Inicializa com o tamanho correto

    this.formId = Number(this.route.snapshot.paramMap.get('formId'));

    this.isLoading = true;

    // Definir o filtro de data padrão para os últimos 30 dias
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filterForm.patchValue({
      data_do_feedback: {
        start: thirtyDaysAgo,
        end: today
      }
    });

    // Buscar a estrutura do formulário
    this.formService.getFormStructure(this.formId).subscribe({
      next: (structure) => {
        // Criar as colunas dinâmicas com base na estrutura
        this.dynamicColumns = structure
          .sort((a: any, b: any) => a.ordenation - b.ordenation) // Ordena pela propriedade 'ordenation'
          .map((field: any) => ({
            field_Id: field.id.toString(), // Garante que o campo seja uma string
            label: field.label,
            type: field.type
          }));

        this.displayedColumns = ['select', ...this.dynamicColumns.map((col) => col.field_Id)];

        // Buscar os feedbacks
        this.fetchFeedbacks();
      },
      error: (error) => {
        console.error('Erro ao carregar a estrutura:', error);
        this.errorMessage = 'Erro ao carregar a estrutura.';
        this.isLoading = false;
      },
    });

    // Aplicar o filtro de data padrão
    this.applyFilters();
  }

  openFilterModal() {
    const currentRange = this.filterForm.value.data_do_feedback;
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      width: '90%',
      data: {
        startDate: currentRange.start || new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: currentRange.end || new Date()
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.feedbacks = result.map((item: any) => {
          const mappedAnswers: any = {};
          const answers = JSON.parse(item.answers);

          answers.forEach((answer: any) => {
            const column = this.dynamicColumns.find((col) => col.field_Id === answer.id_form_field.toString());
            if (column) {
              mappedAnswers[column.field_Id] = answer.value;
            }
          });

          return {
            ...item,
            answers: mappedAnswers,
            selected: false,
          };
        });

        this.feedbacks.sort((a, b) => new Date(b.submitted_At).getTime() - new Date(a.submitted_At).getTime());

        this.feedbacksSorted = new MatTableDataSource(this.feedbacks);
        this.feedbacksSorted.paginator = this.paginator!;
        this.feedbacksSorted.sort = this.sort!;
      }
    });
  }

  applyFilters() {
    const dateRange = this.filterForm.value.data_do_feedback;
    this.feedbacksService.applyFilters(this.formId, dateRange).subscribe({
      next: (data: any[]) => {
        this.feedbacks = data.map((item: any) => {
          const mappedAnswers: any = {};
          const answers = JSON.parse(item.answers);

          answers.forEach((answer: any) => {
            const column = this.dynamicColumns.find((col) => col.field_Id === answer.id_form_field.toString());
            if (column) {
              mappedAnswers[column.field_Id] = answer.value;
            }
          });

          return {
            ...item,
            answers: mappedAnswers,
            selected: false,
          };
        });

        this.feedbacksSorted = new MatTableDataSource(this.feedbacks);
        this.feedbacksSorted.paginator = this.paginator!;
        this.feedbacksSorted.sort = this.sort!;
      },
      error: (error: any) => {
        console.error('Erro ao aplicar filtros:', error);
        this.errorMessage = 'Erro ao aplicar filtros.';
      }
    });
  }

  clearFilters() {
    this.filterForm.reset();
    this.feedbacksSorted.filter = '';
  }

  fetchFeedbacks(): void {
    this.feedbacksService.getFeedbacks(this.formId).subscribe({
      next: (data) => {
        this.feedbacks = data.map((item: any) => {
          const mappedAnswers: any = {};
          const answers = JSON.parse(item.answers);
  
          answers.forEach((answer: any) => {
            const column = this.dynamicColumns.find((col) => col.field_Id === answer.id_form_field.toString());
            if (column) {
              mappedAnswers[column.field_Id] = answer.value;
            }
          });
  
          return {
            ...item,
            answers: mappedAnswers,
            selected: false,
          };
        });
  
        // Ordenar os feedbacks por submitted_At (mais recente primeiro)
        this.feedbacks.sort((a, b) => new Date(b.submitted_At).getTime() - new Date(a.submitted_At).getTime());
  
        // Atualizar o MatTableDataSource com os dados ordenados
        this.feedbacksSorted = new MatTableDataSource(this.feedbacks);
        this.feedbacksSorted.paginator = this.paginator!;
        this.feedbacksSorted.sort = this.sort!;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar os feedbacks:', error);
        this.errorMessage = 'Erro ao carregar os feedbacks.';
        this.isLoading = false;
      },
    });
  }
  

  // Método para selecionar ou desmarcar todos os checkboxes
  toggleSelectAll(event: any): void {
    const isChecked = event.checked;
    this.feedbacks.forEach((feedback) => (feedback.selected = isChecked));
    this.updateSelectedCount();
  }

  // Atualizar a contagem de registros selecionados
  updateSelectedCount(): void {
    this.selectedCount = this.feedbacks.filter((feedback) => feedback.selected).length;
  }

  // Método para excluir os registros selecionados
  deleteSelected(): void {
    const selectedFeedbackIds = this.feedbacks
      .filter((feedback) => feedback.selected)
      .map((feedback) => feedback.id);

    if (selectedFeedbackIds.length > 0) {
      this.feedbacksService.deleteFeedbacks(selectedFeedbackIds).subscribe({
        next: () => {
          this.snackBar.open('Feedbacks removidos com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.clearSelection();
          this.fetchFeedbacks();
        },
        error: (error) => {
          console.error('Erro ao remover feedbacks:', error);
          this.snackBar.open('Erro ao remover feedbacks.', 'Fechar', {
            duration: 3000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  clearSelection(): void {
    this.feedbacks.forEach((feedback) => (feedback.selected = false)); // Remove seleção de todos os itens
    this.updateSelectedCount(); // Atualiza o contador para zero
  }

  viewSelected(): void {
    const selectedFeedback = this.feedbacks.find((feedback) => feedback.selected);
    if (selectedFeedback) {
      this.dialog.open(ViewFeedbackDialogComponent, {
        data: {
          ...selectedFeedback,
          dynamicColumns: this.dynamicColumns
        }
      });
    }
  }
}