import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [MatIconModule],
  selector: 'app-thank-you-dialog',
  templateUrl: './thank-you-dialog.component.html',
  styleUrls: ['./thank-you-dialog.component.scss'],
})
export class ThankYouDialogComponent {}
