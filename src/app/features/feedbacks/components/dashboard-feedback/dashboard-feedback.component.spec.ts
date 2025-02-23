import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFeedbackComponent } from './dashboard-feedback.component';

describe('DashboardComponent', () => {
  let component: DashboardFeedbackComponent;
  let fixture: ComponentFixture<DashboardFeedbackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardFeedbackComponent]
    });
    fixture = TestBed.createComponent(DashboardFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
