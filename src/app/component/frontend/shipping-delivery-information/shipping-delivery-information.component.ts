import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { MetaService } from 'src/app/service/meta.service';

@Component({
  selector: 'app-shipping-delivery-information',
  templateUrl: './shipping-delivery-information.component.html',
  styleUrls: ['./shipping-delivery-information.component.css']
})
export class ShippingDeliveryInformationComponent {
  constructor(private _meta: MetaService, private viewportScroller: ViewportScroller){
    //meta tag
    this._meta.updateTag('title', 'Shipping and Delivery - RevTrip Hotels');
    this._meta.updateTag('description', 'RevTrip Shipping and Delivery Information');

        // Scroll to the top of the page
        this.viewportScroller.scrollToPosition([0, 0]);
  }
}
