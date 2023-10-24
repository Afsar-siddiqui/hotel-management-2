import { Location } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FrontendService } from 'src/app/service/frontend.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  hideFooter: boolean = false;
  constructor(private _location: Location, private route: ActivatedRoute, private _front: FrontendService ){}

  ngOnInit(){

    /* this._location.path();
    if(this._location.path().includes('-')){
      console.log("working footer ", this._location.path())
    } */

    /* Hide footer for view details on url based */
    this._front.sharedFooter$.subscribe((obj:any)=>{
      console.log("obj ", obj)
      obj == true ? this.hideFooter = true: this.hideFooter = false;
    })
    
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

    /* if(this.isMobileView == true){
      this.route.queryParams.subscribe((params:any) => {
        const code = params['code']; // Get the 'code' parameter
        // Check if you want to hide the footer based on the parameter value
        if (code) {
          this.isMobileView == true ? this.hideFooter = true: this.hideFooter = false;
        }
      });
    } */
    
    console.log("screen width ", this.hideFooter, this.isMobileView,  screenWidth < mobileScreenWidth , screenWidth +">"+ mobileScreenWidth)

  }
  

}
