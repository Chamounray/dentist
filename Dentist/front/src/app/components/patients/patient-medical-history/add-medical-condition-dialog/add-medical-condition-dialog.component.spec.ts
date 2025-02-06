import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMedicalConditionDialogComponent } from './add-medical-condition-dialog.component';

describe('AddMedicalConditionDialogComponent', () => {
  let component: AddMedicalConditionDialogComponent;
  let fixture: ComponentFixture<AddMedicalConditionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMedicalConditionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMedicalConditionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
