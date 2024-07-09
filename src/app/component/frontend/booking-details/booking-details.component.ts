import { ViewportScroller } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FrontendService } from 'src/app/service/frontend.service';
import { MetaService } from 'src/app/service/meta.service';
import { MethodService } from 'src/app/service/method.service';
import { ScriptsMethodService } from 'src/app/service/scripts-method.service';
import Swal from 'sweetalert2';

import * as sha256 from 'crypto-js/sha256';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.css']
})
export class BookingDetailsComponent {


  //
  code: string='';
  checkin: string|undefined;
  checkout: string|undefined;
  room_rate_plan_id: number|undefined;
  num_rooms: number=1;
  child: number=0;
  adults: number=1;
  discount: number=0;

  //
  priceDetails:any=[];
  childAge: any=[]; 
  loader: boolean = false;
  hideDummyContent: boolean = false;

  //couponCode
  couponCode:string='';

  //
  isLogin: boolean = false;
  //isLoggedIn: boolean=false;
  userDetails:any;

  isReadonly:boolean = true;

  //form
  userForm: FormGroup;

  constructor(private _scripts: ScriptsMethodService, private _frontend: FrontendService, private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private _method: MethodService,
    private _meta: MetaService, private viewportScroller: ViewportScroller, private http: HttpClient, private el: ElementRef,){
    

    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.required],
      mobile: ['',Validators.required],
    })
  }

  ngOnInit(){
    // Scroll to the top of the page
    this.viewportScroller.scrollToPosition([0, 0]);

    //hide footer on this page
    this._frontend.setSharedFooterValue(true);
    
    //
    this._method.isLoginValue$.subscribe((value:any) => {
      this.isLogin  = value;
      this.patchContactForm();
      this.getCouponCode();
      console.log("working value subscribe ", this.isLogin)
    });

    //check user logged in
    if(localStorage.getItem('api_token')){
      this.isLogin = true;
      this.patchContactForm();
    }else{
      this.getCouponCode();
    }

    //get url query params value
    this.route.queryParams.subscribe((params) => {

      this.checkin = params['checkin'];
      this.checkout = params['checkout'];
      this.room_rate_plan_id = +params['room_rate_plan_id']; // "+" is used to convert the string to a number
      let ref = params['ref'];

      let bookings = params['booking'].split('_');
      this.code = bookings[0];
      this.num_rooms = bookings[3];
      this.adults = bookings[1];
      this.child = bookings[2];
      //assign value to the header component
      this._frontend.setSharedValue({code:this.code, checkin:this.checkin, checkout:this.checkout, adults:this.adults, child:this.child, num_rooms:this.num_rooms, ref:ref});

      this.discount = params['dis'];
      //
      console.log("params ", bookings);
      //this.getBookingPrice();
      this.getHotelListByHotel();

    });

    //meta tag add
    this._meta.updateTitle('Book Your Stay - RevTrip Hotels')
    this._meta.updateTag('title', 'Book Your Stay - RevTrip Hotels');
    this._meta.updateTag('description', 'Securely book your stay at the best hotels with RevTrip.');

    this.childAge = JSON.parse(localStorage.getItem('child_age') || '[]');
    
  }

  patchContactForm(){
      //
      let id = localStorage.getItem('userId');
      let data = {id: id};
      this._frontend.getUserById(data).subscribe((res:any)=>{
        this.userDetails = res.result;
        console.log("Id ", res.result);
        this.userForm.patchValue({
          first_name: res.result.first_name,
          last_name: res.result.last_name,
          email: res.result.email,
          mobile: res.result.mobile,
        })
      })
  }

  couponCodeList:any=[];
  getCouponCode(){
    let user_id = localStorage.getItem('userId') == null ? 0:localStorage.getItem('userId');
    //console.log("localStorage.getItem('userId') ", localStorage.getItem('userId'))
    let hotel_id = JSON.parse(localStorage.getItem('RoomDetails') ?? '{}');
    if(user_id || user_id ==0){
      this._frontend.getCouponCode(hotel_id.code, user_id).subscribe((res:any)=>{
        if(res.result){
          this.couponCodeList = res.result;
          console.log("coupon code ", this.couponCodeList)
        }
      })
    }
  }


  /* When coupon coude select from list
     it will assign the value to  this.promo_d
     second assign the final_dicount 
     and change the value
  */
  selectedCouponCode:string='';
  onSelectCouponCode(list:any){
    this.couponCode = list.code;
    //this.validateCouponCode();
    this.onCouponCode();
    //console.log("select coupon code ", this.selectedCouponCode);
  }
  /* When user type coupon code
     it will store this.couponCode and match with coupon code
     if coupon code match then it will check coupon is expire or not
     if expire then return not valid
     if match then get the discount price and assign the value this.promo_d
  */
 showCouponError: boolean = false;
  onCouponCode(){
    //this.validateCouponCode();
    console.log("validate ")
    let hotel_id = JSON.parse(localStorage.getItem('RoomDetails') ?? '{}');
    let data = { "hotel_id":hotel_id.code, 
    "user_id":localStorage.getItem('userId') == null ? 0:localStorage.getItem('userId'),
    "coupon_code":this.couponCode
    }
    if(this.couponCode){
      this._frontend.validateCoupon(data).subscribe((res:any)=>{
        if(res.status == "Success"){
          this.showCouponError = false;
          this.promo_d = res.result.discount_amount;
          this.f_promo_d = this.promo_d;
          this.f_total_taxt = this.f_total_taxt - this.promo_d;
          console.log("validate if")
        }else{
          this.showCouponError = true;
          this.promo_d = 0;
          this.f_promo_d = 0;
          this.f_total_taxt = this.f_previous_Price;
          this.selectedCouponCode = '';
          console.log("validate else")
        }
      })
    }else{
          this.promo_d = 0;
          this.f_promo_d = 0;
          this.f_total_taxt = this.f_previous_Price;
          this.selectedCouponCode = '';
          this.showCouponError = false
    }
  }


  total_night: number = 0;
  b_price_day: number = 0;

  getBookingPrice(): void {
      const queryData = {
          checkin: this.checkin,
          checkout: this.checkout,
          room_rate_plan_id: this.room_rate_plan_id
      };

      this._frontend.getBookings(queryData).subscribe({
          next: (res: any) => {
              this.priceDetails = Object.values(res.result);
              this.total_night = this.priceDetails.length;
              this.checkGuestNo();
          },
          error: err => {
              console.log("error ", err);
          }
      });
  }


  total_guest:number=0; discountPrice:number=0; price:number=0;
  priceSelect:any = ['', 'single_rate', 'double_rate', 'triple_rate', 'quadruple_rate'];
  soldOut:boolean = false;

  room_rate:number=0;
  checkGuestNo(): void {
    console.log("price details ", this.priceDetails)
    this.priceDetails.forEach((data:any) => {
        this.getPrice(data);
        this.updateFinalTotals();
    });

    if (this.f_total_taxt === 0) {
        this.soldOut = true;
    }
  }

  total:number=0; base_P:number=0; promo_d:number=0; normal_d:number=0; tax: number=0; total_taxt:number=0;
  f_total:number=0; f_base_P:number=0; f_promo_d:number=0; f_normal_d:number=0; f_tax: number=0; f_total_taxt:number=0;
  f_previous_Price: number = 0;
  updateFinalTotals(): void {
    this.f_total += this.total;
    this.f_base_P += this.base_P;
    this.f_promo_d += this.promo_d;
    this.f_normal_d += this.normal_d;
    this.f_tax += this.tax;
    this.f_total_taxt += this.total_taxt;
    this.f_previous_Price = this.f_total_taxt;
    console.log("Final Total tax ", this.f_total_taxt);
  }

  getPrice(data: any): void {
    this.total_guest = Number(this.adults) + Number(this.child);

    let priceValue = 0;
    let base_P = 0;
    let getId = 0; //Math.ceil(this.adults / this.num_rooms) == 0 ? 1 : Math.ceil(this.adults / this.num_rooms);
    /*  */
    if((this.adults/this.num_rooms) >= this.listDetails.base_adults && this.total_guest/this.num_rooms <= this.listDetails.max_guest){
      getId = Math.ceil(this.adults/this.num_rooms) >= this.listDetails.base_adults ? this.listDetails.base_adults : Math.floor(this.adults/this.num_rooms); 
    }else if((this.adults/this.num_rooms) < this.listDetails.base_adults && (this.total_guest)/this.num_rooms <= this.listDetails.max_guest){
      getId = Math.ceil(this.adults/this.num_rooms); 
    }else{
      console.log("else perform",)
      this.soldOut = true;
      return ;
    }
    //console.log("getId ", getId);
    let priceId = this.priceSelect[getId];
    //console.log("priceId ", priceId);
    priceValue = data[priceId];
    console.log("priceValue ", priceValue);
    
    // Get extra adult, child, and base price
    const extraAdults = Math.ceil(Math.max((this.adults / this.num_rooms) - this.listDetails.base_adults, 0));
    const extraAdultPrice = extraAdults * this.listDetails.extra_adult_price;

    //let extraChildPrice = 0;
    const childAges = JSON.parse(localStorage.getItem('child_age') || '[]');

    // Calculate the number of chargeable children (above or equal to the minimum age)
    let chargeableChildren = childAges.filter((age:any) => age > this.listDetails.min_child_age).length;
    if(childAges.length > this.listDetails.base_child){
      //when more then one child age less then base_child then, childAges.length - this.listDetails.base_child = chargeableChildren
      if((childAges.length - chargeableChildren) != this.listDetails.base_child && (childAges.length - chargeableChildren) > this.listDetails.base_child){
        chargeableChildren = childAges.length - this.listDetails.base_child;
      }else if((childAges.length - chargeableChildren) != this.listDetails.base_child){
        chargeableChildren = childAges.length; 
      }
    }
    // Calculate the extra child price based on the number of children exceeding the base limit
    //const extraChildPrice = Math.max(chargeableChildren - this.listDetails.base_child, 0) * this.listDetails.extra_child_price;
    const extraChildPrice = Math.ceil(Math.max(chargeableChildren, 0)) * this.listDetails.extra_child_price;
    /* if (this.adults <= this.listDetails.max_adults * this.num_rooms &&
        this.child <= this.listDetails.max_child * this.num_rooms) {
        if (this.adults > this.listDetails.base_adults * this.num_rooms ||
            this.child > this.listDetails.base_child * this.num_rooms) {
            if (this.adults > this.listDetails.base_adults) {
                let extraAdult = this.adults - this.listDetails.base_adults * this.num_rooms;
                extraAdultPrice = extraAdult * this.listDetails.extra_adult_price;
            }
            //if (this.child > this.listDetails.base_child || childAges?.find((value:any)=> value >this.listDetails.min_child_age) !== -1) {
                //let extraChild = this.child - this.listDetails.base_child * this.num_rooms;
                //extraChildPrice = extraChild * this.listDetails.extra_child_price;
            //}
            // Calculate the number of chargeable children (above or equal to the minimum age)
            const chargeableChildren = childAges.filter((age:any) => age > this.listDetails.min_child_age).length;
            // Calculate the extra child price based on the number of children exceeding the base limit
            extraChildPrice = Math.ceil(Math.max(chargeableChildren, 0)) * this.listDetails.extra_child_price; 
        }
    } else {
        console.log("else perform 2",)
        this.soldOut = true;
    } */

    base_P += Math.floor(priceValue);
    this.base_P = (base_P + extraAdultPrice + extraChildPrice) * this.num_rooms;
    //console.log("price value from booking ", base_P, extraAdultPrice, extraChildPrice, this.num_rooms);

    this.normal_d = (Math.floor((this.listDetails.be_discount * base_P) / 100)) * this.num_rooms;
    this.total = this.base_P - this.normal_d;
    //console.log("price after discount , normal_d", this.total, this.normal_d);

    let tax = (base_P >= 7500) ? (18 * this.total) / 100 : (12 * this.total) / 100;
    this.tax = Math.ceil(tax);

    this.total_taxt = (this.total + this.tax);
    console.log("base_P + tax - discount", this.total_taxt);
}

  



  bookDetails:any;
  listDetails:any; images:any;
  getHotelListByHotel(){
    //
    this.loader = true;

    const queryData = {code: this.code, checkin: this.checkin, checkout:this.checkout , adults:this.adults, child:this.child, num_rooms:this.num_rooms}
    //
    this._frontend.searchHotel(queryData).subscribe({
        next: (res:any)=>{
          let data = res;
          this.listDetails = data.result.Hotel;
          /* const changeStorageValue = {code:this.code, Name: this.listDetails.hotel_name, checkin:this.checkin, checkout:this.checkout, adults:this.adults, child:this.child, num_rooms:this.num_rooms}
          //assign value to the header component
          this._frontend.setSharedValue(changeStorageValue); */
          console.log("list Details", this.listDetails)
          //Gallery
          this.images = data.result.Photos;
          //other rooms
          console.log("hotel ",data);
          //
          this.loader = false;
          //
          this.getBookingPrice();
          //this.checkGuestno();
        },
        error: err=>{
          this.loader = false;
          console.log("error ", err)
        }
      })
  }

//Slider configuartion
slideConfig = {
  enabled: true,
  autoplay: true,
  draggable: false,
  autoplaySpeed: 3000,
  accessibility: true,
  "slidesToShow": 4,
  "slidesToScroll": 1,
  "infinite": false,
  "responsive": [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1
      }
    }
  ]
};
  
/* 
  show and hide model for sign in
*/
onModel(){
  //console.log("working ", document.querySelector('#main-register-wrap'));
  document.querySelector('#main-register-wrap')?.setAttribute('style','display:block')
}

hideModel(){
  document.querySelector('#main-register-wrap')?.setAttribute('style','display:none')
}



/* On route again view page */
/* route on view page when click on hotel */
onRouteDetails(){
  const queryParams = {Name: this.listDetails.hotel_name,checkin: this.checkin, checkout:this.checkout , adults:this.adults, child:this.child, num_rooms:this.num_rooms}
  this.router.navigate([this.listDetails.slug], { queryParams });
}


onPayHotel(){
  if(this.isLogin == true){
    this.contactDetails()
  }else{
    this.onModel();
  }
}

onPayNow(){
  if(this.isLogin == true){
    this.PayDetails()
  }else{
    this.onModel();
  }
}


contactDetails(){
  this.loader = true;
  let data = this.userForm.value;
  //{ "user_id":"1", "hotel_id":"73", "hotel_code":"S5ldSw39Et", "booking_vendor_name":"Portal", "bookingStatus":"confirmed", "confirmationNo":"", "taxes":"870.0", "totalAmount":"2650.0", "checkInDate":"2020-08-10", "checkOutDate":"2020-08-12", "totalAdults":2, "totalChildren":1, "guest_name":"Ranjeet Singh", "guest_email":"ram@xxx.com", "guest_phone":"9986543212", "room_id":"155", "plan_id": "1", "room_rate_plan_id":"308", "room_name":"Deluxe Room", "rate_plan_name":"Room Only", "num_rooms":"1", "paymentStatus":0 }
  let user = this.userDetails;
  let guestDetail = [];
  guestDetail.push({"adult":this.adults, "child": {"total": this.child, "child_age":this.childAge}});
  console.log("guest details ", guestDetail);
  let bookingData = {"user_id": user.id, "hotel_id":this.listDetails.id, "hotel_code": this.listDetails.be_hotel_code, "booking_vendor_name":"Revtrip Hotel", "bookingStatus":"confirmed", "booking_id":"", "room_detail": guestDetail, "taxes":this.f_tax, "totalAmount":this.f_total_taxt, "hotel_discount": this.listDetails.be_discount, "promo_code": this.couponCode, "promo_discount": this.promo_d, "checkInDate": this.checkin, "checkOutDate":this.checkout, "totalAdults":this.bookDetails.adults, "totalChildren":this.bookDetails.child, "guest_name":this.userForm.value.first_name+" "+this.userForm.value.last_name, "guest_email":this.userForm.value.email, "guest_phone":this.userForm.value.mobile, "room_id":this.listDetails.room_id, "plan_id": this.listDetails.plan_id, "room_rate_plan_id": this.room_rate_plan_id, "room_name":this.listDetails.room_name, "rate_plan_name":this.listDetails.plan_name, "num_rooms":this.bookDetails.num_rooms, "paymentStatus":0 }
  //console.log("value ", data);
  //console.log("bookingData ", bookingData);
  if(this.userForm.valid){
    //call pay at Hotel API
    this._frontend.payAtHotel(bookingData).subscribe({
      next: (res:any)=>{
        this.loader = false;
        if(res.status == "Success"){
          //show notification
          Swal.fire({
            position: 'top',
            title: 'Booking Confirm!',
            text: 'You can see more details on your profile',
            icon: 'success',
            confirmButtonText: 'Cheers'
          });
          this.router.navigate(['/user']);
        }else{
          this.loader = false;
          Swal.fire({
            position: 'top',
            title: 'Error!',
            text: res.result,
            icon: 'error',
            confirmButtonText: 'Ok'
          });
        }
        //console.log("response ", res)
      },
      error: (err:any)=>{
        //console.log("error ", err);
        this.loader = false;
        Swal.fire({
          position: 'top',
          title: 'Error!',
          text: err,
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    })
  }else{
    Swal.fire({
      position: 'top',
      title: 'Error!',
      text: 'please fill all required field',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
    this.loader = false;
  }
}

PayDetails(){
  this.loader = true;
  let data = this.userForm.value;
  //{ "user_id":"1", "hotel_id":"73", "hotel_code":"S5ldSw39Et", "booking_vendor_name":"Portal", "bookingStatus":"confirmed", "confirmationNo":"", "taxes":"870.0", "totalAmount":"2650.0", "checkInDate":"2020-08-10", "checkOutDate":"2020-08-12", "totalAdults":2, "totalChildren":1, "guest_name":"Ranjeet Singh", "guest_email":"ram@xxx.com", "guest_phone":"9986543212", "room_id":"155", "plan_id": "1", "room_rate_plan_id":"308", "room_name":"Deluxe Room", "rate_plan_name":"Room Only", "num_rooms":"1", "paymentStatus":0 }
  let user = this.userDetails;
  let guestDetail = [];
  guestDetail.push({"adult":this.adults, "child": {"total": this.child, "child_age":[]}});
  console.log("guest details ", guestDetail);
  let bookingData = {"user_id": user.id, "hotel_id":this.listDetails.id, "hotel_code": this.listDetails.be_hotel_code, "booking_vendor_name":"Revtrip Hotel", "bookingStatus":"Tentative", "booking_id":"", "room_detail": guestDetail, "taxes":this.f_tax, "totalAmount":this.f_total_taxt, "hotel_discount": this.listDetails.be_discount, "promo_code": '', "promo_discount": this.promo_d, "checkInDate": this.checkin, "checkOutDate":this.checkout, "totalAdults":this.adults, "totalChildren":this.child, "guest_name":this.userForm.value?.first_name+" "+this.userForm.value?.last_name, "guest_email":this.userForm.value?.email, "guest_phone":this.userForm.value?.mobile, "room_id":this.listDetails?.room_id, "plan_id": this.listDetails?.plan_id, "room_rate_plan_id": this.room_rate_plan_id, "room_name":this.listDetails?.room_name, "rate_plan_name":this.listDetails?.plan_name, "num_rooms":this.num_rooms, "paymentStatus":0 }
  //console.log("value ", data);
  //console.log("bookingData ", bookingData);
  if(this.userForm.valid){
    //call pay at Hotel API
    this._frontend.payAtHotel(bookingData).subscribe({
      next: (res:any)=>{
        this.loader = false;
        if(res.status == "Success"){
          localStorage.setItem("transectionId", res.result.data.merchantTransactionId);
          //show notification
          //this.router.navigate([res.result.data.instrumentResponse.redirectInfo.url]);
          window.location.href = res.result.data.instrumentResponse.redirectInfo.url;
        }else{
          this.loader = false;
          Swal.fire({
            position: 'top',
            title: 'Error!',
            text: res.result,
            icon: 'error',
            confirmButtonText: 'Ok'
          });
        }
        //console.log("response ", res)
      },
      error: (err:any)=>{
        //console.log("error ", err);
        this.loader = false;
        Swal.fire({
          position: 'top',
          title: 'Error!',
          text: err,
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    })
  }else{
    Swal.fire({
      position: 'top',
      title: 'Error!',
      text: 'please fill all required field',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
    this.loader = false;
  }
}


  //phone pay install
  private paymentDetails = {
    "merchantId": "M1IGEM2OE2F2",
    "merchantTransactionId": "MT7850598538588104",//defferent
    "merchantUserId": "MUID678",//defferent
    "amount": 10000,
    "redirectUrl": "https://webhook.site/redirect-url",
    "redirectMode": "REDIRECT",
    "callbackUrl": "https://webhook.site/callback-url",
    "mobileNumber": "9999999999",
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  }
  private key = "496c5e6b-4cc8-4960-ba76-21aa91ce0774";
  private indexKey = "1";
  initiatePayment() {
    const jsonString = JSON.stringify(this.paymentDetails);
    const data = {"request": btoa(jsonString)};

    let convert = data+this.key+"###"+this.indexKey;
    let verify = sha256(convert).toString();
    console.log("base64 ", data);
    console.log("sha256 ", verify);
    this._frontend.paymentGetway(data, verify).subscribe((res:any)=>{
      console.log("payment ", res)
    })
    
  }


  activeSection: string | null = null;
  //scroll to section
  scrollToPriceSummary(sectionId: string) {
    this.activeSection = sectionId; // Set the active section

    const element = this.el.nativeElement.querySelector('#' + sectionId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  
  /* Active navegation on scroll */
  isMobileView: boolean = false; isFixedShareIcon:boolean=false;
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.checkScrollPosition();
  }


  private checkScrollPosition() {
    const screenWidth = window.innerWidth;
    //const footerPosition = this.el.nativeElement.querySelector('#end-hotel-view').getBoundingClientRect().top;

    // Adjust the threshold value and screen width as needed
    const threshold = 100;
    const mobileScreenWidth = 768; // For example, adjust this based on your design

    this.isMobileView = screenWidth < mobileScreenWidth;

    //hide footer value on mobile
    this.isMobileView == true ? this._frontend.setSharedFooterValue(true): this._frontend.setSharedFooterValue(true);

    //console.log("screen width ", screenWidth < mobileScreenWidth , screenWidth +">"+ mobileScreenWidth)

  }

}
