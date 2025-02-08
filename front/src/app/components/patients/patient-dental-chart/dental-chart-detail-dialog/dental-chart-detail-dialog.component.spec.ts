import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DentalChartDetailDialogComponent } from './dental-chart-detail-dialog.component';

describe('DentalChartDetailDialogComponent', () => {
  let component: DentalChartDetailDialogComponent;
  let fixture: ComponentFixture<DentalChartDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DentalChartDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DentalChartDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
