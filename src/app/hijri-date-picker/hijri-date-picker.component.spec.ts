import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HijriDatePickerComponent } from './hijri-date-picker.component';

describe('HijriDatePickerComponent', () => {
  let component: HijriDatePickerComponent;
  let fixture: ComponentFixture<HijriDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HijriDatePickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HijriDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
