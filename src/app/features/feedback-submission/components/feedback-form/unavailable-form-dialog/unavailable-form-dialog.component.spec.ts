import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnavailableFormDialogComponent } from './unavailable-form-dialog.component';

describe('UnavailableFormDialogComponent', () => {
  let component: UnavailableFormDialogComponent;
  let fixture: ComponentFixture<UnavailableFormDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UnavailableFormDialogComponent]
    });
    fixture = TestBed.createComponent(UnavailableFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
