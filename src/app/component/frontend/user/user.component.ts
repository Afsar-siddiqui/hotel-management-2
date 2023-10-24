import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
import { FrontendService } from 'src/app/service/frontend.service';
import { MethodService } from 'src/app/service/method.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

  isLogin: boolean = false;

  currentDate = new Date();

  constructor(private router: Router, private route: ActivatedRoute, private _frontend: FrontendService, private _method: MethodService ){
    this.currentDate;
    console.log("working ", this.currentDate)
  }

  userId:any; bookingList:any=[]; userDetails:any;
  ngOnInit(){
    this.userId = localStorage.getItem('userId');
    let token = localStorage.getItem('api_token');
    if(this.userId && token){
      //get user booking details
      this._frontend.getUserBookings(this.userId).subscribe((res:any)=>{
        if(res.status == 'Success'){
          console.log("user response ", res.result);
          this.bookingList = res.result;
          if(this.bookingList.length>0){
            let bookingList_new = this.bookingList[0].booking_detail;
            console.log("booking details ", bookingList_new.user_id);
          }
        }
      })
      //get user details
      let data = {id: this.userId}
      this._frontend.getUserById(data).subscribe((res:any)=>{
        if(res.status == 'OK'){
          this.userDetails = res.result;
          console.log("UserDetails ", this.userDetails);
        }
      })
    }else{
      this.router.navigate(['/']);
    }

    //check token exist then login
    if(localStorage.getItem('api_token')){
      this.isLogin = true;
    }

    
  }

  onLogout(){
    //remove token
    localStorage.removeItem('api_token');
    localStorage.removeItem('userId');
    this.router.navigate(['/']);
    this._method.setLogin(false);
    this.isLogin = false;
  }


  onRouteDetails(list:any){
    console.log("working now");
    let date = new Date();
    //next date
    let nextDate = new Date();
    nextDate.setDate(date.getDate() + 1);

    let checkin = moment(date).format('YYYY-MM-DD');  let checkout = moment(nextDate).format('YYYY-MM-DD');
    console.log("checkin ", checkin)
    let adults = 1; let num_rooms = 1; let child = 0;
    if(list.Hotel_code){
      const queryParams = {code: list.Hotel_code,checkin: checkin, checkout: checkout, "adults":adults, "child":child, "num_rooms":num_rooms}
      this.router.navigate(['/view'], { queryParams });
    }
  }


  disableSwitching: boolean=false;
  @ViewChild('tabset') tabset!: TabsetComponent;
  @ViewChild('first') first!: TabDirective;
  @ViewChild('second') second!: TabDirective;

  confirmTabSwitch(tabName:any) {
    if (this.disableSwitching) {
      const confirm = window.confirm('Discard changes and switch tab?');
      if (confirm) {
        this.disableSwitching = false;
        this.second.active = true;
      }
    }
  }

}
