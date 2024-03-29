import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MapComponent } from './map/map.component';
import { GoogleMapsModule } from '@angular/google-maps';

import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';


@NgModule({
  declarations: [
    LoginComponent,
    MapComponent
  ],
  exports: [
    LoginComponent,
    MapComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    //
    GoogleMapsModule,
    GoogleSigninButtonModule,

    //
    ModalModule.forRoot(), 
  ]
})
export class SharedModule { }
