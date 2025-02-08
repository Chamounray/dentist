import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DentistTreatmentPlansComponent } from './dentist-treatment-plans.component';

describe('DentistTreatmentPlansComponent', () => {
  let component: DentistTreatmentPlansComponent;
  let fixture: ComponentFixture<DentistTreatmentPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DentistTreatmentPlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DentistTreatmentPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
