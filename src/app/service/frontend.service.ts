import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FrontendService {

  baseUrl = "https://revchm.com/tests";
  constructor(private http: HttpClient) { 
  }

  getLogin(data:any){
    return this.http.post(this.baseUrl+'/web_login', data);
  }

  getSignUp(data:any){
    return this.http.post(this.baseUrl+'/web_signup', data);
  }

  getMobileNo(mobile:any){
    return this.http.get(this.baseUrl+'/validate_mobile?mobile='+mobile);
  }

  validateOTP(data:any){
    return this.http.post(this.baseUrl+'/validate_otp', data);
  }
  //get user by id
  getUserById(data:any){
    return this.http.post(this.baseUrl+'/get_user', data);
  }

  getHotelName(q:string){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+`/get_hotels?q=${q}`, { headers: headers });
  }

  getCityName(q:string){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+`/get_cities?q=${q}`, { headers: headers });
  }

  //popular hotel on home page
  getPopularHotel(){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+'/get_popular_hotels', { headers: headers })
  }

  //recent hotel home page
  getRecentHotel(){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+'/get_recent_hotels', { headers: headers })
  }

  //popular destination https://revchm.com/tests/popular_destination
  getpopularDestinationHotel(): Observable<any>{
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+'/popular_destination', { headers: headers })
  }

  //similar hotel on details page
  getSimilarHotel(id:any){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+'/get_similar_hotels?id='+id, { headers: headers });
  }

  //contact page
  getContact(data:any){
    return this.http.post(this.baseUrl+'/contact_us', data);
  }

  //Update profile
  updateProfile(data:any){
    return this.http.post(this.baseUrl+'/update_user', data);
  }

  /* get hotel by code */
  searchHotel(data:any){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    //hotel:string, checkin:string, checkout:string, adults:number, child:number, num_rooms:number, city:number
    //https://revchm.com/tests/get_hotel_listing?code=Sk23QFSFlD&checkin=2023-08-28&checkout=2023-08-30&adults=2&child=1&num_rooms=5&city=392
    return this.http.get(this.baseUrl+`/get_hotel_detail?code=${data.code}&checkin=${data.checkin}&checkout=${data.checkout}&adults=${data.adults}&child=${data.child}&num_rooms=${data.num_rooms}`, { headers: headers });
    
  }

  //get hotel by city
  searchCity(data:any): Observable<any>{
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+`/get_hotel_listing?checkin=${data.checkin}&checkout=${data.checkout}&adults=${data.adults}&child=${data.child}&num_rooms=${data.num_rooms}&city=${data.city}`, { headers: headers });
  }

  /* redirect on details page by hotel name */
  get_Hotel_Details_By_Name(data:any){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+`/get_hotel_detail?code=${data.code}&checkin=${data.checkin}&checkout=${data.checkout}&adults=${data.adults}&child=${data.child}&num_rooms=${data.num_rooms}`, { headers: headers });
  }

  //redirect on booking page
  getBookings(data:any){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+`/get_room_rate_plans_rates?checkin=${data.checkin}&checkout=${data.checkout}&room_rate_plan_id=${data.room_rate_plan_id}`, { headers: headers });
  }


  //CouponCode
  getCouponCode(hotel_id:any, user_id:any){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+`/get_coupons?hotel_id=${hotel_id}&user_id=${user_id}`, { headers: headers });
  }

  //validate coupon code
  validateCoupon(data:any){
    return this.http.post(this.baseUrl+`/validate_coupon`,data);
  }


  /* Pay at hotel */
  payAtHotel(data:any){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.post(this.baseUrl+'/portal_push_booking', data, { headers: headers });
  }

  /* get user bookings */
  getUserBookings(id:any){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.get(this.baseUrl+'/get_user_bookings?user_id='+id, { headers: headers })
  }

  //Check Confirmation
  getConfirmation(data:any){
    const headers = new HttpHeaders({'userId': localStorage.getItem('userId') || 0});
    return this.http.post(this.baseUrl+'/check_payment',data)
  }

  paymentGetway(data:any, verify:any){//accept: 'application/json',
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'X-VERIFY': verify
    });
    return this.http.post('https://api.phonepe.com/apis/hermes', data, {headers});
  }



  /* search hotels details */
  private sharedValueSubject = new BehaviorSubject<any>('');
  sharedValue$ = this.sharedValueSubject.asObservable();

  setSharedValue(value: any) {
    this.sharedValueSubject.next(value);
  }

  /* search hotels details */
  private sharedFooter = new BehaviorSubject<boolean>(false);
  sharedFooter$ = this.sharedFooter.asObservable();

  setSharedFooterValue(value: any) {
    this.sharedFooter.next(value);
  }


  onConsole(type='log', message="console message: ", value:any='', value2:any=''){
    if(type == 'table'){
      console.table(message, value)
    }else if(type == 'info'){
      console.info(message, value, value2)
    }else if(type == 'error'){
      console.error(message, value, value2)
    }else{
      console.log(message, value, value2)
    }
  }
  

}
