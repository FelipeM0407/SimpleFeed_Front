import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsService } from '../../services/forms.service';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HostListener } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-form-edit',
  standalone: true,
  imports: [MatTabsModule, MatIconModule, CommonModule],
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.scss'],
})
export class FormEditComponent {
  fields: { id: number; type: string; name: string; label: string; required: boolean; options?: string[] }[] = [];
  iframeContent: SafeHtml = ''; // Usar SafeHtml para conteúdo sanitizado
  isMobile = false; // Define se é mobile
  activeTab = 0; // Tab ativa: 0 = Editor, 1 = Preview


  constructor(private formsService: FormsService, private route: ActivatedRoute, private sanitizer: DomSanitizer) {
    const form_Id = this.route.snapshot.paramMap.get('formId');
    if (form_Id) {
      const numericFormId = +form_Id;

      this.formsService.getFormStructure(numericFormId).subscribe((form) => {
        this.fields = form; // Aqui você já recebe os campos da API
        this.updateIframe();
      });
    }
    this.checkIfMobile();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobile();
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768; // Define como mobile para telas menores que 768px
    if (!this.isMobile) {
      this.activeTab = 0; // Sempre exibe o Editor em telas maiores
    }
  }

  get visibleFields() {
    return this.fields.filter((field) => field.name !== 'data_do_envio');
  }

  // Atualiza o conteúdo do iframe
  updateIframe() {
    let formHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/@angular/material@16.0.0/prebuilt-themes/indigo-pink.css" rel="stylesheet">
        <style>
          body {
            font-family: Roboto, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #333; /* Fundo escuro */
            display: flex;
            justify-content: center;
            align-items: flex-start !important; /* Mantém o formulário no topo */
            height: 100vh;
            overflow-y: auto; /* Habilita scroll vertical */
          }
          .form-container {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
          }
          input, textarea, select {
            width: 100%;
            padding: 8px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          button {
            background-color: #3f51b5;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background-color: #303f9f;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <form>
    `;

    // Adicionar somente os campos que não sejam "data_do_envio"
    this.fields
      .filter((field) => field.name !== 'data_do_envio') // Filtrar o campo `data_do_envio`
      .forEach((field) => {
        if (field.type === 'text' || field.type === 'email') {
          formHtml += `
            <div class="form-group">
              <label>${field.label}</label>
              <input type="${field.type}" ${field.required ? 'required' : ''}>
            </div>
          `;
        } else if (field.type === 'textarea') {
          formHtml += `
            <div class="form-group">
              <label>${field.label}</label>
              <textarea ${field.required ? 'required' : ''}></textarea>
            </div>
          `;
        } else if (field.type === 'date') {
          formHtml += `
            <div class="form-group">
              <label>${field.label}</label>
              <input type="date" ${field.required ? 'required' : ''}>
            </div>
          `;
        } else if (field.type === 'dropdown' && field.options) {
          formHtml += `
            <div class="form-group">
              <label>${field.label}</label>
              <select ${field.required ? 'required' : ''}>
                ${field.options.map((option) => `<option value="${option}">${option}</option>`).join('')}
              </select>
            </div>
          `;
        }
      });

    formHtml += `
              <button type="submit">Enviar</button>
            </form>
          </div>
        </body>
        </html>
      `;

    // Sanitizar o conteúdo do iframe
    this.iframeContent = this.sanitizer.bypassSecurityTrustHtml(formHtml);
  }


  // Atualizar métodos de manipulação para filtrar `data_do_envio`
  moveUp(index: number) {
    // Obtenha o índice real no array `fields` com base no índice do array visível
    const visibleField = this.visibleFields[index];
    const realIndex = this.fields.findIndex((field) => field === visibleField);
  
    if (realIndex > 0) {
      // Troque os campos no array original
      [this.fields[realIndex - 1], this.fields[realIndex]] = [this.fields[realIndex], this.fields[realIndex - 1]];
      this.updateIframe();
    }
  }
  
  moveDown(index: number) {
    // Obtenha o índice real no array `fields` com base no índice do array visível
    const visibleField = this.visibleFields[index];
    const realIndex = this.fields.findIndex((field) => field === visibleField);
  
    if (realIndex < this.fields.length - 1) {
      // Troque os campos no array original
      [this.fields[realIndex + 1], this.fields[realIndex]] = [this.fields[realIndex], this.fields[realIndex + 1]];
      this.updateIframe();
    }
  }

  editField(index: number) {
    console.log('Edit field:', this.fields[index]);
  }

  // Ajustar a exclusão para não permitir excluir `data_do_envio`
  deleteField(index: number) {
    if (this.fields[index].label !== 'data_do_envio') {
      this.fields.splice(index, 1);
      this.updateIframe();
    }
  }
}
