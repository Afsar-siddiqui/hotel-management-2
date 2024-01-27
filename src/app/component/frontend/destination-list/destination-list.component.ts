import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FrontendService } from 'src/app/service/frontend.service';

@Component({
  selector: 'app-destination-list',
  templateUrl: './destination-list.component.html',
  styleUrls: ['./destination-list.component.css']
})
export class DestinationListComponent {

  popularDestinationList:any=[];

  constructor(private _frontend: FrontendService, private viewportScroller: ViewportScroller, private router: Router){}

  ngOnInit(){
    // Scroll to the top of the page
    this.viewportScroller.scrollToPosition([0, 0]);

    this._frontend.getpopularDestinationHotel().subscribe((res:any)=>{
      if(res.status == "OK"){
        this.popularDestinationList = res.result;
      }
      //console.log("popular destination ", this.popularDestinationList);
    })
  }

   /* route on hotel view page based on hotel name */
   navigateToHotel_By_city(list: any) {
    let adults = 1; let num_rooms = 1; let child = 0;

    let date = new Date();
    //next date
    let nextDate = new Date();
    nextDate.setDate(date.getDate() + 1);
    //convert date into format
    let checkin = moment(date).format('YYYY-MM-DD');  let checkout = moment(nextDate).format('YYYY-MM-DD');
    //console.log("checkin ", checkin)
    const queryParams = {checkin:checkin, checkout:checkout, adults:adults, child:child, num_rooms:num_rooms}
    this.router.navigate(['/hotels/'+list.slug], {queryParams});
    localStorage.setItem('search', JSON.stringify(queryParams))

  }

  
}
