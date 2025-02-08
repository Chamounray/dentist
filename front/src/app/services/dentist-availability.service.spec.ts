import { TestBed } from '@angular/core/testing';

import { DentistAvailabilityService } from './dentist-availability.service';

describe('DentistAvailabilityService', () => {
  let service: DentistAvailabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DentistAvailabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
