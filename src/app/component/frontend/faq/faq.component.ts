import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { MetaService } from 'src/app/service/meta.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {

  constructor(private _meta: MetaService, private viewportScroller: ViewportScroller){
    //meta tag
    this._meta.updateTag('title', 'Frequently Asked Questions - RevTrip Hotels');
    this._meta.updateTag('description', 'Find here Frequently Asked Questions');

    // Scroll to the top of the page
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
