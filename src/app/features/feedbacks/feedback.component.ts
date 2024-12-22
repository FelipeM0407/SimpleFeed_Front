import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeedbacksService } from '../forms/services/feedbacks.service';
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
import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
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
    ReactiveFormsModule
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
  dynamicColumns: { field: string; label: string }[] = [];
  displayedColumns: string[] = ['select', 'submittedAt'];
  selectedCount = 0; // Quantidade de registros selecionados
  isMobile = false;

  @ViewChild(MatSort) sort: MatSort | undefined; // ViewChild para o MatSort
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined; // ViewChild para o MatPaginator

  feedbacksSorted: MatTableDataSource<any> = new MatTableDataSource<any>();

  dateRangeForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private feedbacksService: FeedbacksService,
    private formService: FormsService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    @Inject(MAT_DATE_LOCALE) private _locale: string
  ) {
    const today = new Date();
    this.dateRangeForm = this.fb.group({
      dateRange: this.fb.group({
        startDate: [today],
        endDate: [today]
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
  
    // Buscar a estrutura do formulário
    this.formService.getFormStructure(this.formId).subscribe({
      next: (structure) => {
        // Criar as colunas dinâmicas com base na estrutura
        this.dynamicColumns = structure.map((field: any) => ({
          field: field.id.toString(), // Garante que o campo seja uma string
          label: field.label,
          type: field.type
        }));
        
        this.displayedColumns = ['select', ...this.dynamicColumns.map((col) => col.field)];
  
        // Buscar os feedbacks
        this.fetchFeedbacks();
      },
      error: (error) => {
        console.error('Erro ao carregar a estrutura:', error);
        this.errorMessage = 'Erro ao carregar a estrutura.';
        this.isLoading = false;
      },
    });
  }

  openFilterModal() {
    this.dialog.open(FilterDialogComponent, {
      width: '90%',
    });
  }

  applyFilters() {
    // Lógica para aplicar os filtros
    console.log('Aplicando filtros...');
  }

  clearFilters() {
    // Lógica para limpar os filtros
    console.log('Limpando filtros...');
  }

  fetchFeedbacks(): void {
    this.feedbacksService.getFeedbacks(this.formId).subscribe({
      next: (data) => {
        this.feedbacks = data.map((item: any) => {
          const mappedAnswers: any = {};
          const answers = JSON.parse(item.answers);
  
          answers.forEach((answer: any) => {
            const column = this.dynamicColumns.find((col) => col.field === answer.id_form_field.toString());
            if (column) {
              mappedAnswers[column.field] = answer.value;
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

    console.log('Excluir registros:', selectedFeedbackIds);

    // Placeholder para chamar o endpoint de exclusão
    // this.feedbacksService.deleteFeedbacks(selectedFeedbacks.map(f => f.id)).subscribe(() => {
    //   this.feedbacks = this.feedbacks.filter(feedback => !feedback.selected);
    //   this.updateSelectedCount();
    // });
  }

  clearSelection(): void {
    this.feedbacks.forEach((feedback) => (feedback.selected = false)); // Remove seleção de todos os itens
    this.updateSelectedCount(); // Atualiza o contador para zero
  }
}