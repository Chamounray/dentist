import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientRegistrationDialogComponent } from './patient-registration-dialog.component';

describe('PatientRegistrationDialogComponent', () => {
  let component: PatientRegistrationDialogComponent;
  let fixture: ComponentFixture<PatientRegistrationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientRegistrationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientRegistrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
