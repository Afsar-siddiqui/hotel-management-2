import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrontendRoutingModule } from './frontend-routing.module';
import { HomeComponent } from './home/home.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AboutComponent } from './about/about.component';
import { HotelViewComponent } from './hotel-view/hotel-view.component';
import { SimilarHotelComponent } from './similar-hotel/similar-hotel.component';
import { SuggestedHotelsComponent } from './suggested-hotels/suggested-hotels.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { UserComponent } from './user/user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';

//Bootstrap module
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { TabsModule } from 'ngx-bootstrap/tabs';

//
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { HotelListComponent } from './hotel-list/hotel-list.component';
import { RatingModule } from 'ngx-bootstrap/rating';
import { GoogleMapsModule } from '@angular/google-maps';
import { SharedModule } from 'src/app/shared/shared.module';
import { GalleryModule } from 'ng-gallery';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { CancellationRefundPolicyComponent } from './cancellation-refund-policy/cancellation-refund-policy.component';
import { ShippingDeliveryInformationComponent } from './shipping-delivery-information/shipping-delivery-information.component';
import { FaqComponent } from './faq/faq.component';
import { HotelViewByNameComponent } from './hotel-view-by-name/hotel-view-by-name.component';
import { NgxSliderModule } from 'ngx-slider-v2';
import { DestinationListComponent } from './destination-list/destination-list.component';
import { PaymentConfirmComponent } from './payment-confirm/payment-confirm.component';




@NgModule({
  declarations: [
    HomeComponent,
    ContactsComponent,
    AboutComponent,
    HotelViewComponent,
    SimilarHotelComponent,
    SuggestedHotelsComponent,
    BookingDetailsComponent,
    UserComponent,
    HotelListComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    CancellationRefundPolicyComponent,
    ShippingDeliveryInformationComponent,
    FaqComponent,
    HotelViewByNameComponent,
    DestinationListComponent,
    PaymentConfirmComponent,
  ],
  imports: [
    CommonModule,
    FrontendRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    

    ReactiveFormsModule,
    FormsModule,
    SharedModule,

    //bootstrap module
    BsDatepickerModule,
    CarouselModule,
    ProgressbarModule,
    TypeaheadModule,
    TabsModule,

    //
    SlickCarouselModule,
    RatingModule,

    //
    GoogleMapsModule,

    //gallery
    GalleryModule,

    //ngx slider module
    NgxSliderModule,

  ]
})
export class FrontendModule { }


