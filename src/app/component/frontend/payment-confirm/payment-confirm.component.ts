import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FrontendService } from 'src/app/service/frontend.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-confirm',
  templateUrl: './payment-confirm.component.html',
  styleUrls: ['./payment-confirm.component.css']
})
export class PaymentConfirmComponent {

  loader: boolean = false;

  constructor(private _frontend: FrontendService, private router: Router){}

  transId:any;
  ngOnInit(){
    this.transId = localStorage.getItem('transectionId');
    this.pay_confirm();
  }

  list:any; message:any; username:any;
  pay_confirm(){
    this.loader = true;
    let data = {"merchantTransactionId":this.transId}
    if(this.transId){
      this._frontend.getConfirmation(data).subscribe({
        next: (res:any)=>{
          this.list = res;
          //get user name
          let id_data = {id: localStorage.getItem('userId')}
            this._frontend.getUserById(id_data).subscribe((response:any)=>{
              if(response){
                this.username = response.result.first_name +" "+ response.result.last_name;
              }
          })
          //on success
          if(res.result == "Success"){
            //show notification
            this.message = "Thank you, Your booking confirm";
            this.loader = false;
          }else{
            this.message = "Your booking not confirmed";
            this.loader = false;
          }
          //console.log("response ", res)
        },
        error: (err:any)=>{
          //console.log("error ", err);
          this.loader = false;
          this.message = err;
        }
      }) 
    }
  }

}
