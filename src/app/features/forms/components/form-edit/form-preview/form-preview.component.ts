import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SafeUrlPipe } from './safe-url.pipe';
import { environment } from 'src/environments/environment';
import { FormsService } from '../../../services/forms.service';

@Component({
  selector: 'app-form-preview',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './form-preview.component.html',
  styleUrls: ['./form-preview.component.scss']
})
export class FormPreviewComponent {
  @Input() fields: any[] = [];
  @Input() logoBase64: string = '';
  @Input() isMobile = false;
  @Input() formId!: number;
  @Input() reloadKey: number = Date.now();
  urlForm!: string;

  iframeContent: SafeHtml = '';

  constructor(private formService: FormsService) {
    this.urlForm = this.formService.getFrontUrl();
  }
}
