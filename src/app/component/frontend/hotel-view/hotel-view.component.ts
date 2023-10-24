import { Component, Renderer2, ElementRef, Pipe, PipeTransform, HostListener } from '@angular/core';
import { KeyValuePipe, ViewportScroller } from '@angular/common';
import { FrontendService } from 'src/app/service/frontend.service';
import { ScriptsMethodService } from 'src/app/service/scripts-method.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { WishlistService } from 'src/app/service/wishlist.service';
import Swal from 'sweetalert2';
import { GeoService } from 'src/app/service/geo.service';

import { GalleryItem, ImageItem } from 'ng-gallery';
import { MetaService } from 'src/app/service/meta.service';




@Component({
  selector: 'app-hotel-view',
  templateUrl: './hotel-view.component.html',
  styleUrls: ['./hotel-view.component.css']
})
export class HotelViewComponent {


  code: string|undefined;
  checkin: string='';
  checkout: string|undefined;
  adults: number=1;
  child: number=0;
  num_rooms: number=1;


  hideDummyContent: boolean = false;

  loader: boolean = false;
  isReadonly = true;
  max = 5;

  //
  minDate: Date;

  constructor(private _scripts: ScriptsMethodService, private _wishList: WishlistService, private _frontend: FrontendService, private route: ActivatedRoute, private router: Router, private renderer: Renderer2, private el: ElementRef,
    private geo: GeoService, private _meta: MetaService, private viewportScroller: ViewportScroller){
      this.minDate = new Date();

      //
      this.activeSection = 'sec1';
  }

  cartValue:any=[]; params:any={}
  ngOnInit(){
    // Check local storage for search parameters
    // Subscribe to route query params
    this.route.queryParams.subscribe((params) => {
      this.handleSearchParams(params);
    });
    
    //Meta tag
    this._meta.updateTag('keywords','Hotel Booking, Cheap Hotel Rooms, Budget Hotel, Hotel Room Booking, Online Hotel Booking, Hotels in India, Cheap Hotels, Booking Hotels, Hotels Near Me, Discount Hotel Rooms, Online Hotel Reservations, Cheap Hotels in India, Budget Hotels India, Hotels In Guwahati, Hotels In New Delhi, Hotels In Mumbai, Hotels In Pune, Hotels In Chennai, Hotels In Bangalore, Hotels In Goa, Hotels In Kolkata')

    // Scroll to the top of the page
    this.viewportScroller.scrollToPosition([0, 0]);

    
    
    //check value without login
    if(localStorage.getItem('cart')){
      let cart = localStorage.getItem('cart')
      this.cartValue = cart;//JSON.parse(cart)
      console.log("cartValue ", this.cartValue)
    }

  }


  handleSearchParams(params: any) {

    let currentdate = moment(this.minDate).format('YYYY-MM-DD');

    this.code = params['code'];
    this.checkin = params['checkin'];
    this.checkout = params['checkout'];
    this.adults = +params['adults'];
    this.child = +params['child'];
    this.num_rooms = +params['num_rooms'];
  
    this.adultsQuantity = this.adults;
    this.childrenQuantity = this.child;
    this.c_adults = this.adults;
    this.c_child = this.child;
  
    this.getHotelListByHotel();
  
    // Check if checkin is greater than or equal to the current date
    if (this.checkin >= currentdate) {
      // Handle this case
    } else {
      // Get the next date
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      const checkout = moment(nextDate).format('YYYY-MM-DD');
      this.checkin = currentdate;
      this.checkout = checkout;
      // Update localStorage
      localStorage.setItem('search', JSON.stringify({
        code: this.code,
        checkin: this.checkin,
        checkout: this.checkout,
        adults: this.adults,
        child: this.child,
        num_rooms: this.num_rooms
      }));
    }
  }


  ngAfterViewInit(){
    this.getUserLocation();
  }

  smilarHotelList:any=[];
  similarHotel(id:number){
    if(id){
      this._frontend.getSimilarHotel(id).subscribe((res:any)=>{
        this.smilarHotelList = res.result;
        for(let val of this.smilarHotelList){
          let price = parseInt(val.single_rate);
          price = Math.floor(price);
          //discount price
          let dis_price = Math.floor((price * val.be_discount)/100);
          let discountPrice = price - dis_price;
          val['discount_Price'] = discountPrice;
        }
        console.log("similar hotel ", this.smilarHotelList)
      })
    }
  }


  listDetails:any; inventory:any; rooms:any={}; images: GalleryItem[]=[]; total_guest:number=0; discountPrice:number=0; price:number=0;
  soldOut: boolean = false;
  priceSelect:any = ['', 'single_rate', 'double_rate', 'triple_rate', 'quadruple_rate'];
  getHotelListByHotel(){
    //
    this.loader = true;

    const queryData = {code: this.code, checkin: this.checkin, checkout:this.checkout , adults:this.adults, child:this.child, num_rooms:this.num_rooms}
    console.log("params ", queryData);
    //
    this._frontend.searchHotel(queryData).subscribe({
        next: (res:any)=>{
          let data = res;
          this.listDetails = data.result.Hotel;
          //console.log("list Details", this.listDetails)
          //
          this._meta.updateTitle(`${this.listDetails.hotel_name} in ${this.listDetails.city_name}, Hotel Reviews and Ratings.`);
          this._meta.updateTag('title', `${this.listDetails.hotel_name} in ${this.listDetails.city_name}, Hotel Reviews and Ratings.`);
          this._meta.updateTag('description', `Find ${this.listDetails.hotel_name} in ${this.listDetails.city_name}, at cheap and affordable price in ${this.listDetails.city_name}. Select ${this.listDetails.hotel_name} room types, read reviews and book your hotel rooms with revtriphotels.com.`);
          //
          const changeStorageValue = {code:this.code, Name: this.listDetails.hotel_name, checkin:this.checkin, checkout:this.checkout, adults:this.adults, child:this.child, num_rooms:this.num_rooms}
          if(!this.params['Name']){
            localStorage.setItem('search', JSON.stringify(changeStorageValue))
          }
          //assign value to the header component
          this._frontend.setSharedValue(changeStorageValue);

          //hotel id for similar hotel
          this.similarHotel(this.listDetails.id);
          //call map function to load map
          this.setMap_Lat_Long();
          //
          this.total_guest = this.adults + this.child;
          /* ============================================
            When room will be one
          ==============================================*/
          if(this.num_rooms == 1){
            if(this.total_guest <= this.listDetails.max_guest * this.num_rooms){
              //when adults < max adults se tu show kre
              if(this.adults <= this.listDetails.max_adults * this.num_rooms && this.child <= this.listDetails.max_child * this.num_rooms){
                //when adults < base adults ho tu show kre
                if(this.adults <= this.listDetails.base_adults * this.num_rooms && this.child <= this.listDetails.base_child * this.num_rooms){
                  console.log("When child less ", this.adults +" >= "+ this.listDetails.base_adults * this.num_rooms +" For Child "+ this.child +"<="+ this.listDetails.base_child * this.num_rooms)
                  //
                  let priceId = this.priceSelect[this.adults];
                  let priceValue; 
                  //console.log("selected base price ", this.priceSelect[this.adults] +"=="+this.listDetails[priceId]);
                  if(this.listDetails[priceId] !== 0){
                    priceValue = this.listDetails[priceId];
                    //price 
                    this.price = parseInt(priceValue);
                    this.price = Math.floor(this.price);
                    //discount price
                    let dis_price = (this.price * this.listDetails?.be_discount)/100;
                    dis_price = Math.floor(dis_price);
                    this.discountPrice = this.price - dis_price;
                  }else{
                    console.log("person greater then four");
                    this.soldOut = true;
                  }
  
                }else{
  
                  //get which price have to select  (this will return index number for get price this.listDetails.base_adults)
                  //console.log("base adults ", this.listDetails.base_adults);
                  let priceId = this.priceSelect[this.listDetails.base_adults];
                  let priceValue; 
                  //console.log("selected base price ", this.priceSelect[this.listDetails.base_adults] +"=="+this.listDetails[priceId]);
                  if(this.listDetails[priceId] !== 0){
                    priceValue = this.listDetails[priceId] 
                  }
  
                  //when extra child or extra adults
                  let extraChild; let extraAdult; let extraAdultPrice=0; let extraChildPrice=0;
                  if(this.adults > this.listDetails.base_adults){
                    extraAdult = this.adults - this.listDetails.base_adults
                    extraAdultPrice = extraAdult * this.listDetails.extra_adult_price;
                    //console.log("extra adults=", extraAdult +" extra adults price="+ extraAdultPrice);
                  }
                  //
                  if(this.child > this.listDetails.base_child){
                    extraChild = this.child - this.listDetails.base_child;
                    extraChildPrice = extraChild * this.listDetails.extra_child_price;
                    //console.log("extra child=",  extraChild +" extra child price="+ extraChildPrice);
                  }
  
                  //total price value
                  this.price = parseInt(priceValue) + extraAdultPrice + extraChildPrice; 
                  this.price = Math.floor(this.price);
                  console.log("total price with all ",  this.price);
  
                  //Discount price
                  let dis_price = (this.price * this.listDetails?.be_discount)/100;
                  dis_price = Math.floor(dis_price);
                  this.discountPrice = this.price - dis_price;
                  
                }
              }else{
                console.log("max adults & child ",this.adults +">"+ this.listDetails.max_adults * this.num_rooms);
                this.soldOut = true;
              }
            }else{
              console.log("max guest ",this.total_guest +">"+ this.listDetails.max_guest * this.num_rooms);
              this.soldOut = true;
            }
          }




          //discount price
          //======================================================================================
          //When room not will be 1
          //when total guest < max guest ho tu show kre
          if(this.num_rooms > 1){
            console.log("room 1 se zyda ho ", this.num_rooms);
            ///////////////////
            if(this.total_guest <= this.listDetails.max_guest * this.num_rooms){
              //when adults < max adults se tu show kre
              if(this.adults <= this.listDetails.max_adults * this.num_rooms && this.child <= this.listDetails.max_child * this.num_rooms){
                //when adults < base adults ho tu show kre
                if(this.adults <= this.listDetails.base_adults * this.num_rooms && this.child <= this.listDetails.base_child * this.num_rooms){
                  console.log("When child less ", this.adults +" <= "+ this.listDetails.base_adults * this.num_rooms +" For Child "+ this.child +"<="+ this.listDetails.base_child * this.num_rooms)
                  //
                  let adult_room = Math.ceil(this.adults/this.num_rooms);
                  console.log("adult_room ", adult_room);
                  //
                  let priceId = this.priceSelect[adult_room];
                  let priceValue; 
                  //console.log("selected base price ", this.priceSelect[this.adults] +"=="+this.listDetails[priceId]);
                  if(this.listDetails[priceId] !== 0){
                    priceValue = this.listDetails[priceId];
                    //price 
                    this.price = parseInt(priceValue);
                    this.price = Math.floor(this.price);
                    //this.price = this.price * this.num_rooms;
                    //discount price
                    let dis_price = (this.price * this.listDetails?.be_discount)/100;
                    dis_price = Math.floor(dis_price);
                    this.discountPrice = this.price - dis_price;
                  }else{
                    console.log("person greater then four");
                    this.soldOut = true;
                  }
  
                }else{
                  //get which price have to select  (this will return index number for get price this.listDetails.base_adults)
                  //console.log("base adults ", this.listDetails.base_adults);
                  let priceId = this.priceSelect[this.listDetails.base_adults];
                  let priceValue; 
                  //console.log("selected base price ", this.priceSelect[this.listDetails.base_adults] +"=="+this.listDetails[priceId]);
                  if(this.listDetails[priceId] !== 0){
                    priceValue = this.listDetails[priceId] 
                  }
  
                  //when extra child or extra adults
                  let extraChild; let extraAdult; let extraAdultPrice=0; let extraChildPrice=0;
                  if(this.adults > this.listDetails.base_adults){
                    extraAdult = this.adults - this.listDetails.base_adults
                    extraAdultPrice = extraAdult * this.listDetails.extra_adult_price;
                    //console.log("extra adults=", extraAdult +" extra adults price="+ extraAdultPrice);
                  }
                  //
                  if(this.child > this.listDetails.base_child){
                    extraChild = this.child - this.listDetails.base_child;
                    extraChildPrice = extraChild * this.listDetails.extra_child_price;
                    //console.log("extra child=",  extraChild +" extra child price="+ extraChildPrice);
                  }
  
                  //total price value
                  this.price = parseInt(priceValue) + extraAdultPrice + extraChildPrice; 
                  this.price = Math.floor(this.price);
                  //console.log("total price with all ",  this.price);
  
                  //Discount price
                  let dis_price = (this.price * this.listDetails?.be_discount)/100;
                  dis_price = Math.floor(dis_price);
                  this.discountPrice = this.price - dis_price;
                  
                }
              }else{
                console.log("max adults & child ",this.adults +">"+ this.listDetails.max_adults * this.num_rooms);
                this.soldOut = true;
              }
            }else{
              console.log("max guest ",this.total_guest +">"+ this.listDetails.max_guest * this.num_rooms);
              this.soldOut = true;
            }
            //////////////////
          }
          //=====================================================================================
          //available details
          this.inventory = data.result.Inventory;
          //console.log("inventory ",this.inventory);
          //when inventory comes null then show hotel sold out
          if(this.inventory.length == 0){
            this.soldOut = true;
          }
          //Gallery
          if(data.result.Photos){
            this.images = data.result.Photos.map(
              (item:any) => new ImageItem({ src: item.img_name, thumb: item.img_name })
            );
          }
        
          //other rooms
          this.rooms = data.result.Rooms;
          this.rooms = Object.entries(data.result.Rooms);
          console.log("hotel ",data);
          //console.log("hotel ",this.rooms);
          //
          this.loader = false;
        },
        error: err=>{
          this.loader = false;
          console.log("error ", err)
        }
      })
  }


  priceCalculation(){
    //single rate
    console.log('single price ', this.listDetails.single_rate);
    console.log('double price ', this.listDetails.double_rate);
    //double rate
    //base chide and adults
    console.log('base adults ', this.listDetails.base_adults);
    console.log('base child ', this.listDetails.base_child);
    //max child and adults
    console.log('max adults ', this.listDetails.max_adults);
    console.log('max child ', this.listDetails.max_child);
    //extra chlid and adults price
    console.log('etra adults price ', this.listDetails.extra_adult_price);
    console.log('extra child price ', this.listDetails.extra_child_price);

    
  }


  onAccordian(selector:string){
      //console.log("working selector ", selector)
      console.log("working home view ", document.querySelector(selector)?.getAttribute('style'));
      if(document.querySelector(selector)?.getAttribute('style')?.toString() == 'display:block'){
        //console.log("select")
        document.querySelector(selector)?.setAttribute('style', 'display:none')
      }else{
        //console.log("not select")
        document.querySelector(selector)?.setAttribute('style', 'display:block')
      }
  }


  bookDate: any|null|undefined; c_checkIn: string|null|undefined; c_checkOut: string|null|undefined;
  onBookDate(){
    //console.log("book date ", this.bookDate)
    let arrDate = [];
    for(let i=0; i<=this.bookDate.length-1; i++){
      arrDate[i] = this.bookDate[i].toString();
    }
    this.c_checkIn = moment(arrDate[0]).format('YYYY-MM-DD');
    this.c_checkOut = moment(arrDate[1]).format('YYYY-MM-DD');

    //call method for get price on that date
    this.getBookingPrice();
  }

  //handel quantity
  adultsQuantity: number = 1; childrenQuantity: number = 0; c_adults:number=1; c_child:number=0;
  handelQuantity(val: string, type:string){
    //for adults
    switch (type) {
      case 'adults':
        if(this.adultsQuantity<20 && val==='plus'){
          this.adultsQuantity += 1;
        }else if(this.adultsQuantity>1 && val==='min'){
          this.adultsQuantity -= 1;
        }else{}
        this.c_adults = this.adultsQuantity;
        break;
      case 'children':
        if(this.childrenQuantity<10 && val==='plus'){
          this.childrenQuantity += 1;
        }else if(this.childrenQuantity>0 && val==='min'){
          this.childrenQuantity -= 1;
        }else{}
        this.c_child = this.childrenQuantity;
        break;
      default: ;
    }

    //call method for get price on that date
    this.getBookingPrice();
  }

  

  room_rate_plan_id: string='';
  onRouteBooking(list:any){
    //store values in local storage for api call perpous
    let details = {code: this.code, checkin: this.checkin, checkout:this.checkout , adults:this.adults, child:this.child, num_rooms:this.num_rooms}
    localStorage.setItem('RoomDetails', JSON.stringify(details));

    //route based on where click
    if(list == 'room-plan'){
      const queryParams = {checkin:this.checkin, checkout: this.checkout, room_rate_plan_id: this.listDetails.room_rate_plan_id};
      this.router.navigate(['/booking'], { queryParams });
    }else{
      const queryParams = {checkin:this.checkin, checkout: this.checkout, room_rate_plan_id: list.room_rate_plan_id};
      //console.log("plan ", queryParams)
      this.router.navigate(['/booking'], { queryParams });
    }
  }

  room_rate_Id:number=0;
  onCustRouteBooking(){
    if(this.room_rate_Id !=0){
      const queryParams = {checkin:this.c_checkIn, checkout: this.c_checkOut, room_rate_plan_id: this.room_rate_Id};
      //console.log("plan ", queryParams)
      this.router.navigate(['/booking'], { queryParams });
    }
  }


  onChangeHotel(list:any){

      if(list.be_hotel_code){
        //get query params
        const queryParams = { ...this.route.snapshot.queryParams };
        queryParams['code'] = list.be_hotel_code;

        console.log("url ", queryParams)

        
        //change the value
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams,
          queryParamsHandling: 'merge', // This ensures other existing query parameters are preserved
        });
 
      }

  }


  /* ========================================================== */



  total_night:number=0; b_price_day:number=0; priceDetails:any=[];
  getBookingPrice(){
    const queryData = {checkin: this.c_checkIn, checkout:this.c_checkOut , room_rate_plan_id:this.listDetails.room_rate_plan_id}
    console.log("params ", queryData);
    //
    this._frontend.getBookings(queryData).subscribe({
        next: (res:any)=>{
          this.priceDetails = res.result;
          //total length
          this.total_night = this.priceDetails.length;
          //convert object of object into array of object
          const arrayOfObjects = Object.keys(res.result).map(key => ({
            key: key,
            ...res.result[key]
          }));
          console.log("iterate ", arrayOfObjects)
          this.priceDetails = arrayOfObjects;
          //check guest no
          this.checkGuestno();
        },
        error: err=>{
          console.log("error ", err)
        }
      })
  }



  room_rate:number=0;
  checkGuestno(){
    
    //if person greater then base adults then choose room rent based on last rate
    for(let val of this.priceDetails){
      if(this.c_adults > this.listDetails.base_adults){
        if(this.listDetails.base_adults == 1){
          this.room_rate = +val.single_rate;
        }else if(this.listDetails.base_adults == 2){
          this.room_rate = +val.double_rate;
          console.log("test price ", this.room_rate);
        }else if(this.listDetails.base_adults == 3){
          this.room_rate = +val.triple_rate;
        }else if(this.listDetails.base_adults == 4){
          this.room_rate = +val.quadruple_rate;
        }else{
    
        }
      }else{
        //else based on count choose rate
        if(this.c_adults == 1 && this.listDetails.base_adults){
          this.room_rate = +val.single_rate;
        }else if(this.adults == 2){
          this.room_rate = +val.double_rate;
        }else if(this.c_adults == 3){
          this.room_rate = +val.triple_rate;
        }else if(this.c_adults == 4){
          this.room_rate = +val.quadruple_rate;
        }else{
    
        }
      }
      this.priceCal();
      //Final price add here each time
      this.f_total = this.f_total + this.total;
      this.f_base_P = this.f_base_P + this.base_P;
      this.f_promo_d = this.f_promo_d + this.promo_d;
      this.f_normal_d = this.f_normal_d + this.normal_d;
      this.f_tax = this.f_tax + this.tax;
      this.f_total_tax = this.f_total_tax + this.total_taxt;
      console.log("Final Total tax ", this.f_total_tax);
    }
  }

  total:number=0; base_P:number=0; promo_d:number=0; normal_d:number=0; tax: number=0; total_taxt:number=0;
  f_total:number=0; f_base_P:number=0; f_promo_d:number=0; f_normal_d:number=0; f_tax: number=0; f_total_tax:number=0;
  priceCal(){
    let e_adult_p; let e_child_p;
    //check extra adults 
    if(this.c_adults > this.listDetails.base_adults){
      //get extra adults
      let e_adults = this.c_adults - this.listDetails.base_adults;
      //get extra adults price
      e_adult_p = e_adults * this.listDetails.extra_adult_price;
    }

    //check extra child
    if(this.c_child > this.listDetails.base_child){
      //get extra adults
      let e_child = this.c_child - this.listDetails.base_child;
      //get extra adults price
      e_child_p = e_child * this.listDetails.extra_child_price;
    }

    if(e_adult_p || e_child_p){
      //when adults extra
      if(e_adult_p){
        this.base_P = this.room_rate + e_adult_p;
        console.log("e_adults ", this.base_P);
      }
      //when child extra
      if(e_child_p){
        this.base_P = this.room_rate + e_child_p;
        console.log("e_child ", this.base_P);
      }
      //when both extra
      if(e_child_p !=null && e_adult_p !=null){
        this.base_P = this.room_rate + e_adult_p + e_child_p;
        console.log("Both ", this.base_P);
      }
    }else{
      this.base_P = this.room_rate;
      console.log("normal ", this.base_P);
    }

    //normal discount
    this.normal_d = (this.listDetails.be_discount * this.base_P)/100;
    console.log("normal_d ", this.normal_d);
    //total price after discount
    this.total = this.base_P - this.normal_d;
    //tax 12%
    this.tax = (12 * this.base_P)/100;
    //total price after discount and tax
    this.total_taxt = (this.base_P - this.normal_d + this.tax);
    console.log("discount price ", this.total);

    /* for(let val of this.priceDetails){
      this.total_taxt = (this.base_P - this.normal_d + this.tax);
    } */

  }


  activeSection: string | null = null;
  //scroll to section
  scrollToSection(sectionId: string) {
    this.activeSection = sectionId; // Set the active section

    const element = this.el.nativeElement.querySelector('#' + sectionId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* Active navegation on scroll */
  isFixed: boolean = false; isFixedShareIcon:boolean=false; isMobileView: boolean = false;
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.checkScrollPosition();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  private checkScrollPosition() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const screenWidth = window.innerWidth;
    //const footerPosition = this.el.nativeElement.querySelector('#end-hotel-view').getBoundingClientRect().top;

    // Adjust the threshold value and screen width as needed
    const threshold = 100;
    const mobileScreenWidth = 768; // For example, adjust this based on your design

    this.isFixed = scrollPosition > threshold && screenWidth > mobileScreenWidth;

    //for mobile view
    this.isMobileView = screenWidth < mobileScreenWidth;

    //hide footer value on mobile
    this.isMobileView == true ? this._frontend.setSharedFooterValue(true): this._frontend.setSharedFooterValue(false);

    //
    //for fixed side bar share menu
    //this.isFixedShareIcon = scrollPosition > threshold && screenWidth > mobileScreenWidth;
    //this.isFixedShareIcon = scrollPosition > threshold && scrollPosition < footerPosition && screenWidth > mobileScreenWidth;
  }


  /* ============================
      Wish List
  ===============================*/
  addToWishlist(list: any) {
    this._wishList.addToWishlist(list);
  }




  /* ===============================
      Implement map
  ==================================*/
  display: any; position:any={lat: 0, lng: 0}; showMap:boolean=false;
  map = google.maps;
  center: google.maps.LatLngLiteral = {
      lat: 0,
      lng: 0
  };
  zoom = 16;

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }


  currentLocation:any;
  getUserLocation() {
    this.geo.getCurrentLocation().subscribe((position) => {
      this.currentLocation = position;
      //console.log("current location ", this.currentLocation)
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }

  markerPositions: google.maps.LatLngLiteral[] = []; icon:any; label:any;
  setMap_Lat_Long(){
    
    if(this.listDetails){
      //console.log(parseFloat(this.listDetails?.hotel_lat) +"="+  this.listDetails?.hotel_long)
      //set marker on the coordinate
      this.position = { lat: parseFloat(this.listDetails?.hotel_lat), lng: parseFloat(this.listDetails?.hotel_long) }
      this.icon = {
        url: 'assets/images/hotel-icon.png', // Path to your custom icon
        labelOrigin: new google.maps.Point(15, -10), // Adjust label position
        scaledSize: new google.maps.Size(50, 50), //iconsize
      };
      
      this.label = {
        text: this.listDetails?.hotel_name,
        color: '#058003', // Set label color (hex color code)
        fontSize: '14px', // Set label font size
        fontWeight: 'bold', // Set label font weight
      },
      // Set map center to your marker's position
      this.center = this.position;
      // Clear existing marker positions
      this.markerPositions = [];
      // Add your marker position to the array
      this.markerPositions.push(this.position);
    }
  }

  onShowMap(){
    this.showMap = true;
  }

  onCloseMap(){
    this.showMap = false;
  }
  




  /* When click on change details it will show header search */
  searchText: string = 'Search';
  onShowSearch(){ 
    //
    document.querySelector('.show-search-button .fa-search')?.classList.toggle('vis-head-search-close');
    //changing text 
    if(document.querySelector('.show-search-button .fa-search')?.classList.contains('vis-head-search-close')){
      this.searchText = 'Close'
      document.querySelector('.header-search')?.classList.add('vis-head-search');
      document.querySelector('.header-search')?.classList.remove('vis-search"');
    }else{
      this.searchText = 'Search'
      document.querySelector('.header-search')?.classList.add('vis-search"');
      document.querySelector('.header-search')?.classList.remove('vis-head-search');
    }
  }


}
