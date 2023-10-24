import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptsMethodService {

  constructor() { }


/* 
  show and hide dropdown for my account
*/
  dropDown(selector:string, addClass:string){
    console.log("working selector ", selector, addClass)
    //console.log("working ", document.querySelector('.header-user-name'));
    document.querySelector(selector)?.classList.toggle(addClass);
    document.querySelector(selector)?.nextElementSibling?.classList.toggle(addClass)
  }

  dropDownAttributes(selector:string){
    //console.log("working selector ", selector)
    //console.log("working ", document.querySelector(selector)?.getAttribute('style'));
    if(!document.querySelector(selector)?.getAttribute('style')){
      //console.log("select")
      document.querySelector(selector)?.setAttribute('style', 'display:block')
    }else{
      //console.log("not select")
      document.querySelector(selector)?.removeAttribute('style')
    }
  }

  outsideDropDown(){
    console.log("working ");
    document.querySelector('.header-user-name')?.classList.remove('hu-menu-visdec');
    document.querySelector('.header-user-name')?.nextElementSibling?.classList.remove('hu-menu-vis')
  }

}
