import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelViewByNameComponent } from './hotel-view-by-name.component';

describe('HotelViewByNameComponent', () => {
  let component: HotelViewByNameComponent;
  let fixture: ComponentFixture<HotelViewByNameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HotelViewByNameComponent]
    });
    fixture = TestBed.createComponent(HotelViewByNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
