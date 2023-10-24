import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactsComponent } from './contacts/contacts.component';
import { UserComponent } from './user/user.component';
import { HotelViewComponent } from './hotel-view/hotel-view.component';
import { HotelListComponent } from './hotel-list/hotel-list.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { CancellationRefundPolicyComponent } from './cancellation-refund-policy/cancellation-refund-policy.component';
import { ShippingDeliveryInformationComponent } from './shipping-delivery-information/shipping-delivery-information.component';
import { FaqComponent } from './faq/faq.component';
import { HotelViewByNameComponent } from './hotel-view-by-name/hotel-view-by-name.component';
import { DestinationListComponent } from './destination-list/destination-list.component';
import { PaymentConfirmComponent } from './payment-confirm/payment-confirm.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'contact', component: ContactsComponent},
  {path: 'user', component: UserComponent},
  {path: 'view', component: HotelViewComponent},
  {path: 'hotel-list', component: HotelListComponent},
  {path: 'booking', component: BookingDetailsComponent},
  { path: 'city/:cityName', component: HotelListComponent },
  {path: 'city-list', component: DestinationListComponent},
  {path: 'payment-confirm', component: PaymentConfirmComponent},

  //policy page
  {path: 'privacy-policy', component: PrivacyPolicyComponent},
  {path: 'terms-&-conditions', component: TermsConditionsComponent},
  {path: 'cancellation-refund-policy', component: CancellationRefundPolicyComponent},
  {path: 'shipping-delivery', component: ShippingDeliveryInformationComponent},
  {path: 'frequently-asked-questions', component: FaqComponent},

  //based on hotel name view hotel
  { path: ':hotelName', component: HotelViewByNameComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontendRoutingModule { }
