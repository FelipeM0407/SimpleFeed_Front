import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCodeCustomComponent } from './qr-code-custom.component';

describe('QrCodeCustomComponent', () => {
  let component: QrCodeCustomComponent;
  let fixture: ComponentFixture<QrCodeCustomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QrCodeCustomComponent]
    });
    fixture = TestBed.createComponent(QrCodeCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
