import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-form-preview',
  standalone: true,
  imports: [],
  templateUrl: './form-preview.component.html',
  styleUrls: ['./form-preview.component.scss']
})
export class FormPreviewComponent implements OnChanges {
  @Input() fields: any[] = [];
  @Input() logoBase64: string = '';
  @Input() isMobile = false;
  private lastRenderState: string = '';

  iframeContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    if (!this.fields || this.fields.length === 0) return;
  
    const currentState = JSON.stringify(this.fields) + this.logoBase64 + this.isMobile;
    if (currentState === this.lastRenderState) return; // ← evita render redundante
  
    this.lastRenderState = currentState;
    this.generateIframe();
  }

  generateIframe(): void {
    let formHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/@angular/material@16.0.0/prebuilt-themes/indigo-pink.css" rel="stylesheet">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.inputmask/5.0.7/inputmask.min.js"></script>
        <script>
          document.addEventListener("DOMContentLoaded", function () {
            setTimeout(function() {
              let cpfInput = document.querySelector("#cpfField");
              if (cpfInput) {
                Inputmask("999.999.999-99").mask(cpfInput);
              }

              let phoneInput = document.querySelector("#phoneField");
              if (phoneInput) {
                Inputmask("(99) 99999-9999").mask(phoneInput);
              }
            }, 500);
          });
        </script>
        <style>
          body {
            font-family: Roboto, Arial, sans-serif;
            padding: 20px;
            background: #1f1f43;
            display: flex;
            justify-content: center;
            align-items: flex-start !important;
            height: 100vh;
            overflow-y: auto;
          }
          .form-container {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 80%;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
            word-wrap: break-word;
            white-space: normal;
          }
          input, textarea, select {
            width: 100%;
            padding: 8px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
          }
          button {
            background-color: #2C3E50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background-color: #303f9f;
          }
          .rating {
            display: flex;
            flex-direction: row-reverse;
            justify-content: space-between;
          }
          .rating input {
            display: none;
          }
          .rating label {
            font-size: ${this.isMobile ? '2rem' : '4rem'};
            color: #ccc;
            cursor: pointer;
            padding: 0 5px;
          }
          .rating input:checked ~ label,
          .rating label:hover,
          .rating label:hover ~ label {
            color: #f5b301;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          ${this.logoBase64 ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${this.logoBase64}" style="width: 40%; border-radius: 10px" />
            </div>
          ` : ''}
          <form>
    `;

    this.fields
      .filter(field => field.name !== 'data_do_envio')
      .sort((a, b) => a.ordenation - b.ordenation)
      .forEach(field => {
        const label = `<label>${field.label}</label>`;
        switch (field.type) {
          case 'text':
          case 'email':
            formHtml += `<div class="form-group">${label}<input type="${field.type}" ${field.required ? 'required' : ''}></div>`;
            break;
          case 'textarea':
            formHtml += `<div class="form-group">${label}<textarea ${field.required ? 'required' : ''}></textarea></div>`;
            break;
          case 'cpf':
            formHtml += `<div class="form-group">${label}<input type="text" id="cpfField" placeholder="000.000.000-00" ${field.required ? 'required' : ''}></div>`;
            break;
          case 'telephone':
            formHtml += `<div class="form-group">${label}<input type="text" id="phoneField" placeholder="(00) 00000-0000" ${field.required ? 'required' : ''}></div>`;
            break;
          case 'date':
            formHtml += `<div class="form-group">${label}<input type="date" ${field.required ? 'required' : ''}></div>`;
            break;
          case 'dropdown':
            formHtml += `<div class="form-group">${label}<select ${field.required ? 'required' : ''}><option value="0">Selecione uma opção</option>${field.options.map((option: string) => `<option value="${option}">${option}</option>`).join('')}</select></div>`;
            break;
          case 'rating':
            formHtml += `
              <div class="form-group">
                ${label}
                <div class="rating">
                  ${[5,4,3,2,1].map(i => `
                    <input type="radio" id="${field.name}-${i}" name="${field.name}" value="${i}" ${field.required ? 'required' : ''}>
                    <label for="${field.name}-${i}">★</label>
                  `).join('')}
                </div>
              </div>`;
            break;
          case 'multiple_selection':
            formHtml += `
              <div class="form-group">
                ${label}
                <div style="border: 1px solid #ccc; border-radius: 4px; padding: 8px; background: #fff;">
                  ${field.options.map((option: string, index: number) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-bottom: 1px solid #eee;">
                      <div style="flex: 1; text-align: left;">
                        <input type="checkbox" id="${field.name}-${index}" name="${field.name}" value="${option}" ${field.required ? 'required' : ''}>
                      </div>
                      <div style="flex: 9; text-align: end;">
                        <label for="${field.name}-${index}">${option}</label>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
            break;
        }
      });

    formHtml += `
            <button>Enviar</button>
          </form>
        </div>
      </body>
      </html>
    `;

    this.iframeContent = this.sanitizer.bypassSecurityTrustHtml(formHtml);
  }
}
