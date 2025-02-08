import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDentalChartComponent } from './patient-dental-chart.component';

describe('PatientDentalChartComponent', () => {
  let component: PatientDentalChartComponent;
  let fixture: ComponentFixture<PatientDentalChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDentalChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDentalChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
