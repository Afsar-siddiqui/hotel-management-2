import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FrontendService } from 'src/app/service/frontend.service';
import { MetaService } from 'src/app/service/meta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent {

  contactForm: FormGroup;

  //
  captchaText: string = '';
  userAnswer: string = '';

  constructor(private fb: FormBuilder,private _service: FrontendService, private router: Router, private _meta: MetaService, private viewportScroller: ViewportScroller){
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      message: ['', Validators.required],
    })
  }

  ngOnInit(){
    // Scroll to the top of the page
    this.viewportScroller.scrollToPosition([0, 0]);

    this.generateCaptcha();
    //meta tag add
    this._meta.updateTag('description', 'Get in touch with us for any inquiries or assistance.');
    this._meta.updateTag('title', 'Contact Us - RevTrip Hotels');
  }

  generateCaptcha() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 4; // Change this to desired length
    let result = '';

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    this.captchaText = result;
    //console.log("captcha ", this.captchaText)
  }


  onSubmit(){
    let data = this.contactForm.value;
    /* console.log("working", data);
    console.log("captcha ", this.userAnswer.toLowerCase() +"==="+ this.captchaText.toLowerCase()) */

    if(this.contactForm.valid){
      if (this.userAnswer.toLowerCase() === this.captchaText.toLowerCase()) {
        this._service.getContact(data).subscribe({
          next: (res:any)=>{
            console.log("response ", res);
            if(res.status == "OK"){
              Swal.fire({
                position: 'top',
                icon: 'success',
                title: 'Submitted Successfully',
                confirmButtonText: 'Ok'
              })
            }else{
              Swal.fire({
                position: 'top',
                icon: 'error',
                title: "Some error has occured",
                confirmButtonText: 'Ok',
              })
            }
          },
          error: (err:any)=>{
            Swal.fire({
              position: 'top',
              text: err,
              icon: 'error',
              confirmButtonText: 'Ok'
            })
          }
        })
      }else {
        // CAPTCHA is incorrect, provide feedback to the user
        Swal.fire({
          position: 'top',
          text: 'CAPTCHA is incorrect',
          icon: 'error',
          confirmButtonText: 'Ok'
        })
      }
    }else{
      this.contactForm.markAllAsTouched()
    }
    // Generate a new CAPTCHA for the next challenge
    this.generateCaptcha();
  }



  /* =================================
    map   28.39273608815596, 77.31219963798524 28.389043457124583, 77.3126592356871
  ===================================*/
  display: any; position:any={lat: 28.389043457124583, lng: 77.3126592356871};
  center: google.maps.LatLngLiteral = {
      lat: 28.389043457124583,
      lng: 77.3126592356871
  };
  zoom = 16;

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

}
