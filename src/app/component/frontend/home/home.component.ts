import { Component, ElementRef, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { FrontendService } from 'src/app/service/frontend.service';
import { ScriptsMethodService } from 'src/app/service/scripts-method.service';

import * as moment from 'moment';
import { Router } from '@angular/router';
import { WishlistService } from 'src/app/service/wishlist.service';
import Swal from 'sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GeoService } from 'src/app/service/geo.service';
import { MetaService } from 'src/app/service/meta.service';
import { ViewportScroller } from '@angular/common';
import { Observable, map } from 'rxjs';
import { MapDirectionsService } from '@angular/google-maps';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  /* bsInlineValue = new Date();
  bsInlineRangeValue: Date[];
  maxDate = new Date(); */
  childForm: FormGroup|any;

  code: any;
  cityId: number|null|undefined;
  bookDate: any|null|undefined;
  checkIn: string|null|undefined;
  checkOut: string|null|undefined;
  adults: number = 1;
  children: number = 0;
  rooms: number = 1;

  //wish List
  wishList:any=[];
  loader: boolean = false;

  //
  minDate: Date;
  maxDate: Date;

  //
  hideDummyContent:boolean=false;

  //
  modalRef?: BsModalRef;


  constructor(private _scripts: ScriptsMethodService, private _frontend: FrontendService, private router: Router, private _whishList: WishlistService, private fb: FormBuilder,
    private geo: GeoService, private _meta: MetaService, private viewportScroller: ViewportScroller, private mapDirectionsService: MapDirectionsService){
    this.minDate = new Date();
    this.maxDate = new Date();
    /* this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsInlineRangeValue = [this.bsInlineValue, this.maxDate]; */

    const request: google.maps.DirectionsRequest = {
      destination: {lat: 12, lng: 4},
      origin: {lat: 14, lng: 8},
      travelMode: google.maps.TravelMode.DRIVING
    };
    this.directionsResults$ = this.mapDirectionsService.route(request).pipe(map((response:any) => response.result));

  }

  recentHotel:any; popularHotel:any; searchDetails:any={};
  ngOnInit(){
    // Scroll to the top of the page
    this.viewportScroller.scrollToPosition([0, 0]);

    //
    this.childForm = this.fb.group({
      numberOfChildren: [0], // Input field for selecting number of children
      childAges: this.fb.array([]) // Form array for dynamically adding child age form controls
    });

    //Meta tag
    this._meta.updateTitle('RevTrip Hotels - Best Hotel Deals, Discounts, and Reservations')
    this._meta.addTag('title', 'RevTrip Hotels - Best Hotel Deals, Discounts, and Reservations.');
    this._meta.addTag('description', 'Discover unbeatable hotel deals and discounts on RevTrip Hotels. Explore a world of travel possibilities, book your dream accommodations, and save on your next adventure. Start your journey today!');
    this._meta.addTag('keywords','Hotel Booking, Cheap Hotel Rooms, Budget Hotel, Hotel Room Booking, Online Hotel Booking, Hotels in India, Cheap Hotels, Booking Hotels, Hotels Near Me, Discount Hotel Rooms, Online Hotel Reservations, Cheap Hotels in India, Budget Hotels India, Hotels In Guwahati, Hotels In New Delhi, Hotels In Mumbai, Hotels In Pune, Hotels In Chennai, Hotels In Bangalore, Hotels In Goa, Hotels In Kolkata')
    //get the bookin details from local storage if exist
    if(localStorage.getItem('search')){
      this.searchDetails = JSON.parse(localStorage.getItem('search') as string);
      //send value to header
      this._frontend.setSharedValue(this.searchDetails)
      //set value if previous value exist
      if(this.searchDetails.city){
        this.place = this.searchDetails.Name;
        this.cityId = this.searchDetails.city;
        //console.log("city ", this.searchDetails.cityName)
      }else{
        this.place = this.searchDetails.Name;
        this.code = this.searchDetails.code;
      }
      
      //assign child room and
      this.adultsQuantity = this.searchDetails.adults
      this.childrenQuantity = this.searchDetails.child
      this.roomsQuantity = this.searchDetails.num_rooms;
      //for search purpose
      this.adults = this.adultsQuantity;
      this.children =this.childrenQuantity;
      this.rooms = this.roomsQuantity;
      //assigned date checkin:this.checkIn, checkout:this.checkOut,
      this.bookDate = this.searchDetails.checkin +" - "+this.searchDetails.checkout;
      
      //console.log("Date ", this.bookDate)
      this.checkIn = this.searchDetails.checkin;
      this.checkOut = this.searchDetails.checkout;

      if (localStorage.getItem('child_age')) {
        this.generateChildAges();
      }
    }

    //Recently added hotel
    this._frontend.getRecentHotel().subscribe((res:any)=>{
      this.recentHotel = res.result;
      
      for(let val of this.recentHotel){
        let price = parseInt(val.single_rate);
        price = Math.floor(price);
        //discount price
        let dis_price = Math.floor((price * val.be_discount)/100);
        let discountPrice = price - dis_price;
        val['discount_Price'] = discountPrice;
      }
    })

    //Popupal Hotel
    this._frontend.getPopularHotel().subscribe((res:any)=>{
      let listValue = res;
      this.popularHotel = listValue.result;
      //console.log("popular ", this.popularHotel)
      for(let val of this.popularHotel){
        let price = parseInt(val.single_rate);
        price = Math.floor(price);
        //discount price
        let dis_price = Math.floor((price * val.be_discount)/100);
        let discountPrice = price - dis_price;
        val['discount_Price'] = discountPrice;
      }
    })
  }

  // Getter for accessing child ages form array
  get childAgesArray() {
    return this.childForm?.get('childAges') as FormArray;
  }

  // Method to generate child age form controls based on the selected number of children
  generateChildAges() {
    if (localStorage.getItem('child_age')) {
      const child_age = JSON.parse(localStorage.getItem('child_age') || '');
      //console.log("working age ", child_age, this.childrenQuantity);
      const formArray = this.childForm?.get('childAges') as FormArray;
      formArray.clear();
      // Patch the retrieved child age values into the form array
      for(let i=0; i< this.childrenQuantity; i++){
        if(child_age.length-1 >= i){
          formArray.push(this.fb.control(child_age[i], [Validators.required, Validators.max(17)]));
        }else{
          formArray.push(this.fb.control(0, [Validators.required, Validators.max(17)]));
        }
      }
    } else {
      // Clear existing form controls if no child age values are found
      const formArray = this.childForm.get('childAges') as FormArray;
      formArray.clear();
  
      // Add form control for each child age
      for (let i = 0; i < this.childrenQuantity; i++) {
        formArray.push(this.fb.control(0, [Validators.required, Validators.max(17)]));
      }
    }
  }
  

  // Method to handle change in the number of children
  onNumberOfChildrenChange() {
    this.generateChildAges(); // Generate child age form controls
  }

  popularDestinationList:any; itemsToShow: number=0;
  ngAfterViewInit(){
    this.setItemsToShow();
    this._frontend.getpopularDestinationHotel().subscribe((res:any)=>{
      if(res.status == "OK"){
        this.popularDestinationList = res.result.slice(0,this.itemsToShow);
      }
      //console.log("popular destination ", this.popularDestinationList);
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.setItemsToShow();
  }
  private setItemsToShow() {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 992) { // Desktop view
      this.itemsToShow = 12;
    } else if (screenWidth >= 576) { // Tablet view
      this.itemsToShow = 8;
    } else { // Mobile view
      this.itemsToShow = 8; // Adjust this number for smaller screens if needed
    }
  }


  /*  */
  slides:any = [
    {img: "assets/images/gal/3.jpg"},
    {img: "assets/images/gal/1.jpg"},
    {img: "assets/images/gal/6.jpg"},
    {img: "assets/images/gal/8.jpg"},
    {img: "assets/images/gal/4.jpg"},
    {img: "assets/images/gal/2.jpg"},
  ];
  slideConfig = {
    enabled: true,
    autoplay: true,
    draggable: false,
    autoplaySpeed: 600000,
    accessibility: true,
    "slidesToShow": 4,
    "slidesToScroll": 1,
    "infinite": false,
    "responsive": [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  slideConfigPopular = {
    enabled: true,
    autoplay: true,
    draggable: false,
    autoplaySpeed: 3000,
    accessibility: true,
    "slidesToShow": 2,
    "slidesToScroll": 1,
    "infinite": false,
    "responsive": [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  
  
  /*  */
  place:string=''; show_searchHotel: boolean = false;
  onPlace(){
    this.show_searchHotel = true;
    //console.log("plcae ", this.place);
    if(this.place){
      this.getCityList(this.place);
      this.getHotelList(this.place);
    }
  }

  
  hotelList:any;
  getHotelList(place:string){
    let q = place;
    this._frontend.getHotelName(q).subscribe((res:any)=>{
      let listValue = res.result;
      this.hotelList = listValue;
      //console.log("hotel list ", this.hotelList);
    })
  }

  cityList:any;
  getCityList(place:string){
    let q = place;
    this._frontend.getCityName(q).subscribe((res:any)=>{
      let listValue = res;
      this.cityList = listValue.result;
      //console.log("City list ", this.cityList);
    })
  }

  /* Sellect all fill details */
  cityName: string=''; hotelName:string='';
  onSelectPlace(list:any){
    this.cityId = null;
    this.code = null;
    //console.log("select plcae ", list);
    this.place= list.name;
    //
    if(list.id){
      this.cityId = list.slug == null ? list.id: list.slug;
      this.cityName = list.name;
      localStorage.setItem('search', JSON.stringify({city: this.cityId, Name: this.cityName, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}));
    }

    if(list.be_hotel_code){
      this.code = list.slug == null ? list.be_hotel_code:list.slug;
      this.hotelName = list.name;
      localStorage.setItem('search', JSON.stringify({code:this.code, Name: this.hotelName, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}))
    }
    //console.log("plcae id ", this.code);

    this.show_searchHotel = false;
  }

  @ViewChild('searchList') searchList!: ElementRef;
  /* dropPlace(){
    this.show_searchHotel = false;
  } */
  @HostListener('document:click', ['$event'])
  dropPlace(event: Event): void {
    if (!this.searchList?.nativeElement.contains(event.target)) {
      this.show_searchHotel = false;
    }
  }

  
  onBookDate(){
    //console.log("BookDate", this.bookDate)
    let arrDate = [];
    for(let i=0; i<=this.bookDate.length-1; i++){
      arrDate[i] = this.bookDate[i].toString();
    }
    this.checkIn = moment(new Date(arrDate[0])).format('YYYY-MM-DD');
    this.checkOut = moment(new Date(arrDate[1])).format('YYYY-MM-DD');
    console.log("BookDate", this.checkIn, this.checkOut)

    //if date already exist and then change date it should to change loacl storage also
    if(this.searchDetails){
      if(this.searchDetails.city){
        localStorage.setItem('search', JSON.stringify({city: this.cityId, Name: this.searchDetails.Name, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}));
      }else if(this.searchDetails.code){
        localStorage.setItem('search', JSON.stringify({code:this.code, Name: this.searchDetails.Name, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}));
      }
    }
  }


/* ============================
      Wish List
===============================*/
addToWishlist(list: any) {
  this._whishList.addToWishlist(list);
}


  //handel quantity
  adultsQuantity: number = 1; childrenQuantity: number = 0; roomsQuantity: number = 1;
  handelQuantity(val: string, type:string){
    //for adults
    switch (type) {
      case 'adults':
        if(this.adultsQuantity<20 && val==='plus'){
          this.adultsQuantity += 1;
        }else if(this.adultsQuantity>1 && val==='min'){
          this.adultsQuantity -= 1;
        }else{}
        this.adults = this.adultsQuantity;
        break;
      case 'children':
        if(this.childrenQuantity<10 && val==='plus'){
          this.childrenQuantity += 1;
          this.onNumberOfChildrenChange();
        }else if(this.childrenQuantity>0 && val==='min'){
          this.childrenQuantity -= 1;
          this.onNumberOfChildrenChange();
        }else{}
        this.children = this.childrenQuantity;
        break;
      case 'rooms':
        if(this.roomsQuantity<20 && val==='plus'){
          this.roomsQuantity += 1;
        }else if(this.roomsQuantity>1 && val==='min'){
          this.roomsQuantity -= 1;
        }else{}
        this.rooms = this.roomsQuantity;
        break;
      default: ;
    }
  }


  //search hotel list
  onSearch(): void {
    if(!this.isChildAge()){
      this.showErrorMessage("please provide child age")
      return ;
    }
    // Get current date
    const currentDate: string = this.formatDate(this.minDate);
    const nextDate: string = this.formatDate(this.getNextDate());
    //console.log("booking date ", currentDate)
    // Check if check-in date is valid
    if (this.isValidCheckinDate(currentDate)) {
      this.handleValidCheckinDate(currentDate, nextDate);
    } else {
      this.handleInvalidCheckinDate();
    }
  }
  
  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }
  
  getNextDate(): Date {
    const nextDate: Date = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }
  
  isValidCheckinDate(currentDate: string): boolean {
    this.searchDetails = JSON.parse(localStorage.getItem('search') as string);
    if(this.searchDetails?.checkin){
      return  this.searchDetails?.checkin >= currentDate;
    }else{ return true}
  }

  isChildAge(): boolean{
    const includesZero = this.childAgesArray.value.includes(0);
    //console.log("working child", this.childAgesArray, includesZero)
    if(includesZero){ return false;}
    else{return true}
  }
  
  handleValidCheckinDate(currentDate: string, nextDate: string): void {
    if (this.bookDate && this.place) {
      if (this.code) {
        const queryParams = {
          Name: this.hotelName,
          checkin: this.checkIn,
          checkout: this.checkOut,
          adults: this.adults,
          child: this.children,
          num_rooms: this.rooms,
          city: this.cityId,
        };
        this.navigateToDetailsPage(queryParams);
      } else if (this.cityId) {
        const queryParams = {
          checkin: this.checkIn,
          checkout: this.checkOut,
          adults: this.adults,
          child: this.children,
          num_rooms: this.rooms,
        };
        this.navigateToHotelListPage(queryParams);
      }
      this.child_age_store();
    } else {
      if (!this.bookDate) {
        this.showErrorMessage('Please select booking date');
      }
      if (!this.place) {
        this.showErrorMessage('Please select city or hotel');
      }
    }
  }
  
  handleInvalidCheckinDate(): void {
    this.showErrorMessage('Please check your booking date');
    this.bookDate = `${this.searchDetails?.checkin} - ${this.searchDetails?.checkout}`;
    this.checkIn = this.formatDate(this.minDate);
    this.checkOut = this.formatDate(this.getNextDate());
  }
  
  navigateToDetailsPage(queryParams: any): void {
    this.router.navigate([this.code], { queryParams });
    localStorage.setItem('search', JSON.stringify({ code: this.code, ...queryParams }));
  }
  
  navigateToHotelListPage(queryParams: any): void {
    this.router.navigate(['/hotels/' + this.cityId], { queryParams });
    localStorage.setItem('search', JSON.stringify(queryParams));
  }
  
  showErrorMessage(message: string): void {
    Swal.fire({
      position: 'top',
      text: message,
      icon: 'info',
      confirmButtonText: 'Ok'
    });
  }
  
  child_age_store(){
    localStorage.setItem("child_age", JSON.stringify(this.childAgesArray.value));
  }


   /* route on view page when click on hotel */
   onRouteDetails(list:any){
    let date = new Date();
    //next date
    let nextDate = new Date();
    nextDate.setDate(date.getDate() + 1);
    //
    let checkin = moment(date).format('YYYY-MM-DD');  let checkout = moment(nextDate).format('YYYY-MM-DD');
    //console.log("checkin ", checkin)
    let adults = 1; let num_rooms = 1; let child = 0;
    if(list.be_hotel_code){
      localStorage.setItem('search', JSON.stringify({code:this.code, Name: list.hotel_name, checkin: checkin, checkout: checkout, "adults":adults, "child":child, "num_rooms":num_rooms}))
      const queryParams = {code: list.be_hotel_code, checkin: checkin, checkout: checkout, "adults":adults, "child":child, "num_rooms":num_rooms}
      this.router.navigate(['/view'], { queryParams });
    }
  }

  /* route on hotel view page based on hotel name */
  navigateToHotel_By_name(list: any) {
    //this.loader = true;
    let adults = 1; let num_rooms = 1; let child = 0;
    let date = new Date();
    //next date
    let nextDate = new Date();
    nextDate.setDate(date.getDate() + 1);
    //
    let checkin = moment(date).format('YYYY-MM-DD');  let checkout = moment(nextDate).format('YYYY-MM-DD');
    //console.log("checkin ", checkin)
    if(list.slug){
      const queryParams = {checkin: checkin, checkout: checkout, "adults":adults, "child":child, "num_rooms":num_rooms}
      this.router.navigate([list.slug], {queryParams});
      localStorage.setItem('search', JSON.stringify({code:list.slug, Name: list.hotel_name, checkin:checkin, checkout:checkout, adults:adults, child:child, num_rooms: num_rooms}))
    }
  }

    /* route on hotel view page based on hotel name */
    navigateToHotel_By_city(list: any) {
      let adults = 1; let num_rooms = 1; let child = 0;
      this.cityName = list.name;
      this.cityId = list.slug;

      let date = new Date();
      //next date
      let nextDate = new Date();
      nextDate.setDate(date.getDate() + 1);
      //convert date into format
      let checkin = moment(date).format('YYYY-MM-DD');  let checkout = moment(nextDate).format('YYYY-MM-DD');
      //console.log("checkin ", checkin)
      if(list.slug){
        const queryParams = {checkin:checkin, checkout:checkout, adults:adults, child:child, num_rooms:num_rooms}
        this.router.navigate(['/hotels/'+this.cityId], {queryParams});
        //this.router.navigate(['city/'+list.slug], {queryParams});
        localStorage.setItem('search', JSON.stringify({city: this.cityId, ...queryParams}));
        
      }
    }

  allHotels(){
    let date = new Date();
    //next date
    let nextDate = new Date();
    nextDate.setDate(date.getDate() + 1);
    //
    let checkin = moment(date).format('YYYY-MM-DD');  let checkout = moment(nextDate).format('YYYY-MM-DD');
    //console.log("checkin ", checkin)
    let adults = 1; let num_rooms = 1; let child = 0;
    const queryParams = {city: 0,checkin: checkin, checkout: checkout, "adults":adults, "child":child, "num_rooms":num_rooms}
    this.router.navigate(['/hotels/city'], { queryParams });
    localStorage.setItem('search', JSON.stringify({city: 0, Name: this.cityName, checkin:checkin, checkout:checkout, adults:adults, child:child, num_rooms:num_rooms}))
  }


  onDropDown(selector:string, addClass:string){
    this._scripts.dropDown(selector, addClass);
  }

  onDropDownAttributes(selector:string){
    this._scripts.dropDownAttributes(selector);
  }




  /* ====================================
        Modal map
  =======================================*/
  onMapModel(){
    //console.log("working ", document.querySelector('#main-register-wrap'));
    document.querySelector('#main-map-wrap')?.setAttribute('style','display:block')
  }
  
  hideModel(){
    document.querySelector('#main-map-wrap')?.setAttribute('style','display:none')
  }
  
  onMapModelClose(){
    document.querySelector('#main-map-wrap')?.setAttribute('style','display:none');
  }

  /* ===============================
      Implement map
  ==================================*/
  display: any; markerPositions: google.maps.LatLngLiteral[]=[{lat: 28.607175836152127, lng: 77.1547731311415}]; showMap:boolean=false;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  center: google.maps.LatLngLiteral = {
      lat: 28.607175836152127,
      lng: 77.1547731311415
  };
  zoom = 12; //28.607175836152127, 77.1547731311415

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  /* addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.markerPositions.push(event.latLng.toJSON())
  } */

  readonly directionsResults$: Observable<google.maps.DirectionsResult|undefined>;


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



  setMap_Lat_Long(list:any){
    if(list){
      console.log(parseFloat(list?.hotel_lat) +"="+  list?.hotel_long)
      //set marker on the coordinate
      this.markerPositions.push({ lat: parseFloat(list?.hotel_lat), lng: parseFloat(list?.hotel_long) })
      //set map for location cordinate
      this.center = {
        lat: parseFloat(list?.hotel_lat),
        lng: parseFloat(list?.hotel_long)
      };
    }
  }


  dir:any;
  getDirection(list: any) {
    if (list) {
      let srcLat, srcLng;
  
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          srcLat = position.coords.latitude;
          srcLng = position.coords.longitude;
  
          this.dir = {
            origin: { latitude: srcLat, longitude: srcLng },
            destination: { latitude: parseFloat(list?.hotel_lat), longitude: parseFloat(list?.hotel_long) }
          };
  
          console.log('originDest', this.dir.origin, this.dir.destination);
          let p = `${srcLat},${srcLng}`;
          let d = `${list?.hotel_lat},${list?.hotel_long}`;
          window.open(`https://www.google.com/maps/dir/?api=1&origin=${p}&destination=${d}&travelmode=driving`, '_blank');
        });
      }
    }
  }


  ngOnDestroy(){

  }


}
