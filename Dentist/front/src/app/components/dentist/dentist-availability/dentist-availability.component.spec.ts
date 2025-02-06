import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DentistAvailabilityComponent } from './dentist-availability.component';

describe('DentistAvailabilityComponent', () => {
  let component: DentistAvailabilityComponent;
  let fixture: ComponentFixture<DentistAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DentistAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DentistAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
