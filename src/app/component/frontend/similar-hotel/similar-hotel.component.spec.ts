import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarHotelComponent } from './similar-hotel.component';

describe('SimilarHotelComponent', () => {
  let component: SimilarHotelComponent;
  let fixture: ComponentFixture<SimilarHotelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimilarHotelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimilarHotelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
