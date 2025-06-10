import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDetailsDialogComponent } from './plan-details-dialog.component';

describe('PlanDetailsDialogComponent', () => {
  let component: PlanDetailsDialogComponent;
  let fixture: ComponentFixture<PlanDetailsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlanDetailsDialogComponent]
    });
    fixture = TestBed.createComponent(PlanDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
