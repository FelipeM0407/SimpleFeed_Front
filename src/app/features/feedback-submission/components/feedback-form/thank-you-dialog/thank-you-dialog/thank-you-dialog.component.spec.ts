import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThankYouDialogComponent } from './thank-you-dialog.component';

describe('ThankYouDialogComponent', () => {
  let component: ThankYouDialogComponent;
  let fixture: ComponentFixture<ThankYouDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThankYouDialogComponent]
    });
    fixture = TestBed.createComponent(ThankYouDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
