import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTreatmentPlanDialogComponent } from './add-treatment-plan-dialog.component';

describe('AddTreatmentPlanDialogComponent', () => {
  let component: AddTreatmentPlanDialogComponent;
  let fixture: ComponentFixture<AddTreatmentPlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTreatmentPlanDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTreatmentPlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
