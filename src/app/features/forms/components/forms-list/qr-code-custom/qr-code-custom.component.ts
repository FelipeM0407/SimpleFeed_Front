import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import QRCodeStyling, { Extension } from 'qr-code-styling';

@Component({
  selector: 'app-qr-code-custom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-code-custom.component.html',
  styleUrls: ['./qr-code-custom.component.scss']
})
export class QrCodeCustomComponent implements OnChanges {
  @ViewChild('qrCodeContainer', { static: true }) qrCodeContainer!: ElementRef;
  @ViewChild('canvas', { static: true }) canvas?: ElementRef;
  @Input() filename: string = '';

  @Input() data!: string;
  @Input() logoBase64!: string;
  @Input() color: string = '#000000';
  extension = 'svg';

  get qrCodeSize(): number {
    return this.filename === '' ? 200 : 256;
  }

  qrCode = new QRCodeStyling({
    width: this.qrCodeSize,
    height: this.qrCodeSize,
    data: '',
    image: this.logoBase64 || '',
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 1,
      imageSize: 0.6,
      hideBackgroundDots: true
    },
    dotsOptions: {
      color: this.color,
      type: 'rounded'
    },
    backgroundOptions: {
      color: '#ffffff'
    },
    qrOptions: {
      errorCorrectionLevel: 'H'
    }
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (this.canvas) {
      this.qrCode.update({
        data: this.data,
        image: this.logoBase64 || '',
        dotsOptions: {
          color: this.color
        },
      });

      this.canvas.nativeElement.innerHTML = '';
      this.qrCode.append(this.canvas.nativeElement);
    }
  }

  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\d_\-]+/g, '-')
      .replace(/-+/g, '-');
  }


  onChange(event: any): void {
    this.extension = event.target.value;
  }

  download(): void {
    this.qrCode.download({ name: this.sanitizeFilename(this.filename), extension: 'png' });
  }
}
