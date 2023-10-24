import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MethodService {

  private isLoggedin = new Subject<boolean>();
  isLoginValue$ = this.isLoggedin.asObservable();

  constructor() { }

  setLogin(value: boolean) {
    this.isLoggedin.next(value);
  }

  getLoggedIn(){
    return this.isLoggedin;
  }


}
