import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingDeliveryInformationComponent } from './shipping-delivery-information.component';

describe('ShippingDeliveryInformationComponent', () => {
  let component: ShippingDeliveryInformationComponent;
  let fixture: ComponentFixture<ShippingDeliveryInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShippingDeliveryInformationComponent]
    });
    fixture = TestBed.createComponent(ShippingDeliveryInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
