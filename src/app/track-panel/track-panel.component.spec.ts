import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackPanelComponent } from './track-panel.component';

describe('TrackPanelComponent', () => {
  let component: TrackPanelComponent;
  let fixture: ComponentFixture<TrackPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
