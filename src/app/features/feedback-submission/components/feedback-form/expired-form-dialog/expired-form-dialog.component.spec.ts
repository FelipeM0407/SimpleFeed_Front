import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredFormDialogComponent } from './expired-form-dialog.component';

describe('ExpiredFormDialogComponent', () => {
  let component: ExpiredFormDialogComponent;
  let fixture: ComponentFixture<ExpiredFormDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExpiredFormDialogComponent]
    });
    fixture = TestBed.createComponent(ExpiredFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
