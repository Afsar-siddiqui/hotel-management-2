import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { MetaService } from 'src/app/service/meta.service';

@Component({
  selector: 'app-cancellation-refund-policy',
  templateUrl: './cancellation-refund-policy.component.html',
  styleUrls: ['./cancellation-refund-policy.component.css']
})
export class CancellationRefundPolicyComponent {

  constructor(private _meta: MetaService, private viewportScroller: ViewportScroller){
    //meta tag
    this._meta.updateTag('title', 'Cancellation and Refund Policy - RevTrip Hotels');
    this._meta.updateTag('description', 'Find here Cancellation and Refund Policy');

    // Scroll to the top of the page
    this.viewportScroller.scrollToPosition([0, 0]);
  }
  
}
