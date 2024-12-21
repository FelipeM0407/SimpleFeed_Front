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
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';

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
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
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
        this.dynamicColumns = structure
          .filter((field: any) => field.order !== 0) // Ignorar submittedAt na estrutura
          .sort((a: any, b: any) => a.order - b.order)
          .map((field: any) => ({
            field: field.label, // Usar o label como identificador para outras colunas
            label: field.label, // Usar o rótulo para o cabeçalho
          }));

        this.displayedColumns = ['select', 'submittedAt', ...this.dynamicColumns.map((col) => col.field)];

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

          // Adicionar o submittedAt no início
          mappedAnswers['submittedAt'] = item.submittedAt;

          // Mapear os valores das respostas pelo 'order'
          item.answers.forEach((answer: any) => {
            const column = this.dynamicColumns.find((col, index) => index + 1 === answer.order); // Ajustar pelo índice
            if (column) {
              mappedAnswers[column.field] = answer.value;
            }
          });

          return {
            ...item,
            answers: mappedAnswers, // Respostas mapeadas
            selected: false, // Adicionar propriedade de seleção
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