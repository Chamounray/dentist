import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DentistAppointmentsComponent } from './dentist-appointments.component';

describe('DentistAppointmentsComponent', () => {
  let component: DentistAppointmentsComponent;
  let fixture: ComponentFixture<DentistAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DentistAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DentistAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
