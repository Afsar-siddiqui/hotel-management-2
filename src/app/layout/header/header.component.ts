import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { FrontendService } from 'src/app/service/frontend.service';
import { MethodService } from 'src/app/service/method.service';
import { ScriptsMethodService } from 'src/app/service/scripts-method.service';
import { WishlistService } from 'src/app/service/wishlist.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  hotelId: string|null|undefined;
  cityId: number|null|undefined;
  bookDate: any|null|undefined;
  checkIn: string|null|undefined;
  checkOut: string|null|undefined;

  //
  minDate: Date;
  maxDate: Date;

  //
  searchDetails:any;

  //
  isReadonly:boolean = true;
  max:number=5;

  isLogin: boolean = false;

  constructor(private elementRef: ElementRef, private _method: MethodService, private router: ActivatedRoute, private route: Router, private _frontend: FrontendService, private _scripts: ScriptsMethodService, private _wishList: WishlistService){
    this.minDate = new Date();
    this.maxDate = new Date();
  }

  ngOnInit(){

    //get wishList
    this.getWishlist();

    //When add new wishList then reflect on header
    this._wishList.getWishListIObservable().subscribe((items:any) => {
      this.wishList = items
      this.wishList = this.wishList.slice(0,5);
      return this.wishList;
    });

    console.log("login ", this.isLogin);
    //
    this._method.isLoginValue$.subscribe((value:any) => {
      this.isLogin = value;
    });
    //check token exist then login
    if(localStorage.getItem('api_token')){
      this.isLogin = true;
    }


     //get the bookin details from local storage if exist
     if(localStorage.getItem('search')){
        this.searchDetails = JSON.parse(localStorage.getItem('search') as string);
        //set value if previous value exist
        if(this.searchDetails.city){
          this.place = this.searchDetails.Name;
          this.cityId = this.searchDetails.city;
          //console.log("city ", this.searchDetails.cityName)
        }else{
          this.place = this.searchDetails.Name;
          this.hotelId = this.searchDetails.code;
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
      }else{
        
      }

      //get value from other component
      this._frontend.sharedValue$.subscribe((value) => {
        console.log("help ", value);
        this.searchDetails = value;
        //set value if previous value exist
        if(this.searchDetails.city){
          this.place = this.searchDetails.Name;
          this.cityId = this.searchDetails.city;
          //console.log("city ", this.searchDetails.cityName)
        }else{
          this.place = this.searchDetails.Name;
          this.hotelId = this.searchDetails.code;
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
      });
  }
 


//handel quantity
adultsQuantity: number = 1; childrenQuantity: number = 0; roomsQuantity: number = 1;
adults:number = 1;  children:number = 0;  rooms:number = 1;
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
      }else if(this.childrenQuantity>0 && val==='min'){
        this.childrenQuantity -= 1;
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


/*  */
hotelList:any;
  getHotelList(place:string){
    let q = place;
    this._frontend.getHotelName(q).subscribe((res:any)=>{
      let listValue = res.result;
      this.hotelList = listValue;
      console.log("hotel list ", this.hotelList);
    })
  }

  cityList:any;
  getCityList(place:string){
    let q = place;
    this._frontend.getCityName(q).subscribe((res:any)=>{
      let listValue = res;
      this.cityList = listValue.result;
      console.log("City list ", this.cityList);
    })
  }


  /* Get Hotel booking date */
  onBookDate(){

    let arrDate = [];
    for(let i=0; i<=this.bookDate.length-1; i++){
      //moment(val).format('YYYY-MM-DD');
      arrDate[i] = this.bookDate[i].toString();
    }
    this.checkIn = moment(new Date(arrDate[0])).format('YYYY-MM-DD');
    this.checkOut = moment(new Date(arrDate[1])).format('YYYY-MM-DD');
    

    //if date already exist and then change date it should to change loacl storage also
    if(this.searchDetails){
      console.log("this.searchDetails when select date ", this.searchDetails)
      if(this.searchDetails.city){
        localStorage.setItem('search', JSON.stringify({city: this.cityId, Name: this.searchDetails.Name, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}));
      }
      if(this.searchDetails.code){
        localStorage.setItem('search', JSON.stringify({code:this.hotelId, Name: this.searchDetails.Name, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}));
      }
    }
  }


  place:string=''; show_searchHotel:boolean=false;
  onPlace(){
    this.show_searchHotel = true;
    console.log("plcae ", this.place);
    if(this.place){
      this.getCityList(this.place);
      this.getHotelList(this.place);
    }
  }

   /* Sellect all fill details */
   cityName: string=''; hotelName:string='';
   onSelectPlace(list:any){
    this.cityId = null;
    this.hotelId = null;
    console.log("select plcae ", list);
    this.place= list.name;
    //
    if(list.id){
      this.cityId = list.id;
      this.cityName = list.name;
      localStorage.setItem('search', JSON.stringify({city: this.cityId, Name: this.cityName, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}));
    }
    //
    if(list.be_hotel_code){
      this.hotelId = list.be_hotel_code;
      this.hotelName = list.name;
      localStorage.setItem('search', JSON.stringify({code:this.hotelId, Name: this.hotelName, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}))
    }
    
    this.show_searchHotel = false;
  }

  dropPlace(){
    this.show_searchHotel = false;
  }

  onSearch(){
    //get current date
    let currentdate = moment(this.minDate).format('YYYY-MM-DD');
    //console.log("date check ", this.searchDetails.checkin +"<="+ currentdate)
    if(this.searchDetails){
      this.searchDetails = JSON.parse(localStorage.getItem('search') as string);
      if(this.searchDetails.checkin >= currentdate){}else{
        Swal.fire({
          position: 'top',
          text: 'Please check your booking date old',
          icon: 'info',
          confirmButtonText: 'Ok'
        });
        return ;
      }
    }

    this.hotelId =this.searchDetails.code;
    const queryParams = {code:this.hotelId, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms, city: this.cityId}
    //redirect on details page when choose hotel
    if(this.bookDate && this.place){
      if(this.hotelId){
        this.route.navigate(['/view'], {queryParams});
        localStorage.setItem('search', JSON.stringify({code:this.hotelId, Name: this.hotelName, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}))
      }
  
      //redirect on hotel list page when choose city
      if(this.cityId){
        this.route.navigate(['/hotel-list']);
        localStorage.setItem('search', JSON.stringify({city: this.cityId, Name: this.cityName, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}))
      }
      this.onShowSearch();
    }else{
      //when booking date null
      if(!this.bookDate){
        Swal.fire({
          position: 'top',
          text: 'Please select booking date',
          icon: 'info',
          confirmButtonText: 'Ok'
        });
      }
      //when place null
      if(!this.place){
        Swal.fire({
          position: 'top',
          text: 'Please select city or hotel',
          icon: 'info',
          confirmButtonText: 'Ok'
        });
      }
    }
  }


  /* Route wish list product */
  onRouteWishList(){
    //
    const queryParams = {code:this.hotelId, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms, city: this.cityId}
    //
    if(this.hotelId){
      this.route.navigate(['/view']);
      localStorage.setItem('search', JSON.stringify({code:this.hotelId, Name: this.hotelName, checkin:this.checkIn, checkout:this.checkOut, adults:this.adults, child:this.children, num_rooms:this.rooms}))
    }
  }

/* 
  show and hide mobile menu
*/
showMenu(){
  document.querySelector('.main-menu')?.classList.toggle('vismobmenu');
}

onWishlistLink(){
  document.querySelector('.wishlist-link')?.classList.toggle('scwllink');
  console.log("working ", document.querySelector('.wishlist-wrap')?.classList.contains('novis_wishlist'))

  document.querySelector('.wishlist-wrap')?.classList.toggle('ps')

  if(document.querySelector('.wishlist-wrap')?.classList.contains('novis_wishlist')){
    document.querySelector('.wishlist-wrap')?.classList.add('vis-wishlist')
    document.querySelector('.wishlist-wrap')?.setAttribute('style', 'display:block')
    document.querySelector('.wishlist-wrap')?.classList.remove('novis_wishlist')
  }else{
    document.querySelector('.wishlist-wrap')?.classList.remove('vis-wishlist')
    document.querySelector('.wishlist-wrap')?.removeAttribute('style')
    document.querySelector('.wishlist-wrap')?.classList.add('novis_wishlist')
  }
}


/* 
  show and hide dropdown for my account
*/
  dropDown(){
    console.log("working ", document.querySelector('.header-user-name'));
    document.querySelector('.header-user-name')?.classList.toggle('hu-menu-visdec');
    document.querySelector('.header-user-name')?.nextElementSibling?.classList.toggle('hu-menu-vis')
  }

  outsideDropDown(){
    console.log("working ");
    document.querySelector('.header-user-name')?.classList.remove('hu-menu-visdec');
    document.querySelector('.header-user-name')?.nextElementSibling?.classList.remove('hu-menu-vis')
  }

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

  /* Logout */

  onLogout(){
    //remove token
    localStorage.removeItem('api_token');
    localStorage.removeItem('userId');
    this.route.navigate(['/']);
    this._method.setLogin(false);
    this.isLogin = false;
  }


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


  

/* 
  close current event which is open in your browser
  like click outside and model will be closed
*/
@HostListener('document:click', ['$event'])
  onClick(event: Event) {
    // Check if the click target is outside of the button
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.outsideDropDown()
      //this.hideModel();
    }
  }


  onDropDown(selector:string, addClass:string){
    this._scripts.dropDown(selector, addClass);
  }

  /* ============================
          Get Wish List
  ===============================*/
  wishList:any;
  getWishlist() {

    //
    this.wishList = this._wishList.getWishlist();
    this.wishList = this.wishList.slice(0,5)
    return this.wishList;
  }


  removeWishList(list:any){
    this._wishList.removeWishList(list);
    return this.getWishlist()
  }

}
