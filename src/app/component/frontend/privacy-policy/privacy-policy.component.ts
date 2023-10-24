import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { MetaService } from 'src/app/service/meta.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent {

  constructor(private _meta: MetaService, private viewportScroller: ViewportScroller){
    //meta tag
    this._meta.updateTag('title', 'Privacy Policy - RevTrip Hotels');
    this._meta.updateTag('description', 'RevTrip Privacy Policy');

    // Scroll to the top of the page
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
