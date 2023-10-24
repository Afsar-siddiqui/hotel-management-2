import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestedHotelsComponent } from './suggested-hotels.component';

describe('SuggestedHotelsComponent', () => {
  let component: SuggestedHotelsComponent;
  let fixture: ComponentFixture<SuggestedHotelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuggestedHotelsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestedHotelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
