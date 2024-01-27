import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FrontendService {

  baseUrl = "https://revchm.com/tests";
  constructor(private http: HttpClient) { }

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
    return this.http.get(this.baseUrl+`/get_hotels?q=${q}`);
  }

  getCityName(q:string){
    return this.http.get(this.baseUrl+`/get_cities?q=${q}`);
  }

  //popular hotel on home page
  getPopularHotel(){
    return this.http.get(this.baseUrl+'/get_popular_hotels')
  }

  //recent hotel home page
  getRecentHotel(){
    return this.http.get(this.baseUrl+'/get_recent_hotels')
  }

  //popular destination https://revchm.com/tests/popular_destination
  getpopularDestinationHotel(): Observable<any>{
    return this.http.get(this.baseUrl+'/popular_destination')
  }

  //similar hotel on details page
  getSimilarHotel(id:any){
    return this.http.get(this.baseUrl+'/get_similar_hotels?id='+id);
  }

  //contact page
  getContact(data:any){
    return this.http.post(this.baseUrl+'/contact_us', data);
  }

  /* get hotel by code */
  searchHotel(data:any){
    //hotel:string, checkin:string, checkout:string, adults:number, child:number, num_rooms:number, city:number
    //https://revchm.com/tests/get_hotel_listing?code=Sk23QFSFlD&checkin=2023-08-28&checkout=2023-08-30&adults=2&child=1&num_rooms=5&city=392
    return this.http.get(this.baseUrl+`/get_hotel_detail?code=${data.code}&checkin=${data.checkin}&checkout=${data.checkout}&adults=${data.adults}&child=${data.child}&num_rooms=${data.num_rooms}`);
    
  }

  //get hotel by city
  searchCity(data:any): Observable<any>{
    return this.http.get(this.baseUrl+`/get_hotel_listing?checkin=${data.checkin}&checkout=${data.checkout}&adults=${data.adults}&child=${data.child}&num_rooms=${data.num_rooms}&city=${data.city}`);
  }

  /* redirect on details page by hotel name */
  get_Hotel_Details_By_Name(data:any){
    return this.http.get(this.baseUrl+`/get_hotel_detail?code=${data.code}&checkin=${data.checkin}&checkout=${data.checkout}&adults=${data.adults}&child=${data.child}&num_rooms=${data.num_rooms}`);
  }

  //redirect on booking page
  getBookings(data:any){
    return this.http.get(this.baseUrl+`/get_room_rate_plans_rates?checkin=${data.checkin}&checkout=${data.checkout}&room_rate_plan_id=${data.room_rate_plan_id}`);
  }


  //CouponCode
  getCouponCode(hotel_id:any, user_id:any){
    return this.http.get(this.baseUrl+`/get_coupons?hotel_id=${hotel_id}&user_id=${user_id}`,);
  }

  //validate coupon code
  validateCoupon(data:any){
    return this.http.post(this.baseUrl+`/validate_coupon`,data);
  }


  /* Pay at hotel */
  payAtHotel(data:any){
    return this.http.post(this.baseUrl+'/portal_push_booking', data);
  }

  /* get user bookings */
  getUserBookings(id:any){
    return this.http.get(this.baseUrl+'/get_user_bookings?user_id='+id)
  }

  //Check Confirmation
  getConfirmation(data:any){
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

  

}
