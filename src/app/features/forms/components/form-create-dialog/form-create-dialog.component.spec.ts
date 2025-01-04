import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCreateDialogComponent } from './form-create-dialog.component';

describe('FormCreateDialogComponent', () => {
  let component: FormCreateDialogComponent;
  let fixture: ComponentFixture<FormCreateDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormCreateDialogComponent]
    });
    fixture = TestBed.createComponent(FormCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
