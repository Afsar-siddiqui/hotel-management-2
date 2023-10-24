import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { MetaService } from 'src/app/service/meta.service';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.css']
})
export class TermsConditionsComponent {
  constructor(private _meta: MetaService, private viewportScroller: ViewportScroller){
    //meta tag
    this._meta.updateTag('title', 'Terms & Conditions - RevTrip Hotels');
    this._meta.updateTag('description', 'RevTrip Terms & Conditions Information');

    // Scroll to the top of the page
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
