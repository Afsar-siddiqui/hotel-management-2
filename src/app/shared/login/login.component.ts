import { Component, EventEmitter, Output, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FrontendService } from 'src/app/service/frontend.service';
import { MethodService } from 'src/app/service/method.service';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  signUpForm: FormGroup;
  otpForm: FormGroup;
  mobilenoForm: FormGroup;
  childForm: FormGroup;
  loader:boolean=false;
  childrenQuantity: number = 0;
  
  submitted: boolean = false;

  constructor(private fb: FormBuilder,private _service: FrontendService,private _method: MethodService,private route: Router, private location: Location, private a_route: ActivatedRoute,
              private authService: SocialAuthService, private httpClient: HttpClient){
    this.loginForm = this.fb.group({
      mobile: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    this.childForm = this.fb.group({
      numberOfChildren: [0], // Input field for selecting number of children
      childAges: this.fb.array([]) // Form array for dynamically adding child age form controls
    })

    this.signUpForm = this.fb.group({
      first_name: ['',],
      last_name: ['',],
      email: ['',],
      mobile: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      password: ['', [Validators.required,]],
      user_ip:['']
    });

    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]{1}')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]{1}')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]{1}')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]{1}')]]
    });

    this.mobilenoForm = this.fb.group({
      id: [0],
      mobile: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
    })
  }

  
  socialUser!: SocialUser; isLoggedin: boolean = false;
  ngOnInit(){
    if(!localStorage.getItem('api_token')){
      this.authService.authState.subscribe((user) => {
        this.onModelClose();
        this.socialUser = user;
        //
        localStorage.setItem('api_token', user.idToken);
        localStorage.setItem('userId', user.id);
        //set isLogin true;
        this._method.setLogin(true);

        //
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: 'success',
          timerProgressBar: false,
          timer: 3000,
          title: 'Signed in successfully'
        })
        //
        this.isLoggedin = user != null;
        //console.log(this.socialUser);
        const data ={first_name: user.firstName, last_name: user.lastName, email: user.email, mobile:"", password:"", user_ip:"", signin_by:"gmail"}
        this._service.getSignUp(data).subscribe({
          next: (res:any)=>{
            console.log("signup ", res);
            if(res.status == "NOK"){
              localStorage.setItem('userId', res.result.data.id);
              //call this for register mobile no from user
              if(!res.result.data.mobile){
                this.onMobileModel();
              }
            }else if(res.status == "OK"){
              localStorage.setItem('userId', res.result.data.id);
              //call this for register mobile no from user
              if(!res.result.data.mobile){
                this.onMobileModel();
              }
            }
          },
          error: (err:any)=>{

          }
        })
      });
    }
    const childArray = JSON.parse(localStorage.getItem('child_age') || '[]');
    this.a_route.queryParams.subscribe((params) => {
      if(params['ref'] && childArray.length >= 0){
        this.childrenQuantity = params['child'] === undefined ? 0 : +params['child'];
        //console.log("working age ", params['ref'] , childArray.length, this.childrenQuantity)
        if(this.childrenQuantity != childArray.length ){
          this.onChildAgeModel();
        }
      }
      //
    });
  }

  register_mobile(){
    const data = this.mobilenoForm.value;
    data['id']= localStorage.getItem('userId'),
    this._service.updateProfile(data).subscribe({
      next: (res:any)=>{
        if(res.status == 'OK'){
          this.onMobileModelClose();
          this.loader = false;
          Swal.fire({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            icon: 'success',
            timerProgressBar: false,
            timer: 3000,
            title: 'Register successfully'
          });
        }else{
          //close loader
          this.loader = false;
          Swal.fire({
            position: 'top',
            text: res.result,
            icon: 'error',
            confirmButtonText: 'Ok'
          })
        }
      },
      error: err=>{
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: 'error',
          timerProgressBar: false,
          timer: 5000,
          title: err
        })
      }
    })
  }
  /* private accessToken = '';
  getAccessToken(): void {
    this.authService.getAccessToken(GoogleLoginProvider.PROVIDER_ID).then(accessToken => {
      this.accessToken = accessToken;
      console.log('this.accessToken', this.accessToken);
    });
  } */
  
  /* refreshToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  } */

  response:any;
  onSubmit(){
    let data = this.loginForm.value;
    //console.log("working", data);

    if(this.loginForm.valid){
      //show loader
      this.loader = true;
      this._service.getLogin(data).subscribe({
        next: (res:any)=>{
          this.response = res;
          //this.router.navigate(['admin'])
          console.log("login", res)
          if(this.response.status == 'OK'){
            this.onModelClose();
            //close loader
            this.loader = false;
            //navigate on dashboard
            // this.route.navigate(['user']);
            //set token
            let token = this.response.result['api_token'];
            let user = this.response.result;
            localStorage.setItem('api_token', token);
            localStorage.setItem('userId', user.id);
            //set isLogin true;
            this._method.setLogin(true);
            
            //
            Swal.fire({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              icon: 'success',
              timerProgressBar: false,
              timer: 3000,
              title: 'Signed in successfully'
            })
          }else{
            //close loader
            this.loader = false;
            Swal.fire({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              icon: 'error',
              timerProgressBar: false,
              timer: 5000,
              title: res.result
            })
          }
        },
        error: err=>{
          this.loader = false;
          Swal.fire({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            icon: 'error',
            timerProgressBar: false,
            timer: 5000,
            title: err
          })
        }
      })
    }else{
      this.loginForm.markAllAsTouched()
    }
  }


 /*  onSignUp(){
    //Sign Up model Close
    this.onModelClose()
    //Otp model Open
    this.onOTPModel();
  } */

  onSignUp(){
    let data = this.signUpForm.value;
    //console.log("working", data);
    //this.route.navigate(['user'])
    if(this.signUpForm.valid){
      //show loader
      this.loader = true;
      this._service.getSignUp(data).subscribe({
        next: (res:any)=>{
          //this.router.navigate(['admin'])
          console.log("Sign Up", res)
          if(res.status == 'OK'){
            this.onModelClose();
            this.loader = false;
            //navigate on dashboard
            //set token
            /* let token = this.response.result['api_token'];
            let user = this.response.result; */
            /* localStorage.setItem('api_token', token);
            localStorage.setItem('userId', user.id); */
            //set isLogin true;
            localStorage.setItem("mobileNo", this.signUpForm.value.mobile);
            localStorage.setItem("password", this.signUpForm.value.password);
            //call otp model
            this.onOTPModel();
          }else{
            //close loader
            this.loader = false;
            Swal.fire({
              position: 'top',
              text: res.result,
              icon: 'error',
              confirmButtonText: 'Ok'
            })
          }
        },
        error: err=>{
          Swal.fire({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            icon: 'error',
            timerProgressBar: false,
            timer: 5000,
            title: err
          })
        }
      })
    }else{
      this.signUpForm.markAllAsTouched()
    }
  }


  mobile_exist:boolean = false;
  onCehckNo(){
    let mobileNo = this.signUpForm.value.mobile;
    if(mobileNo.toString().length<10){
      return ;
    }
    if(mobileNo){
      this._service.getMobileNo(mobileNo).subscribe((res:any)=>{
        //console.log("res ", res);
        if(res.status == "NOK"){
          this.mobile_exist = true;
        }else{
          this.mobile_exist = false;
        }
        this.signUpForm.get('mobile')?.updateValueAndValidity(); 
      })
    }else{
      this.mobile_exist = false;
      this.signUpForm.get('mobile')?.updateValueAndValidity(); 
    }
  }

  



  onChangeTab(tab:string){
    //tabsMenu('.tabs-menu a');
    if(tab == 'tab1'){
      document.querySelector('.tab #tab-1')?.setAttribute('style','display:block')
      document.querySelector('.tab #tab-2')?.setAttribute('style','display:none')

      console.log("working ",document.querySelector('a')?.parentElement);
      document.querySelector('#current')?.parentElement?.classList.add('current')
      document.querySelector('#current1')?.parentElement?.classList.remove('current')
    }else if(tab == 'tab2'){
      document.querySelector('.tab #tab-2')?.setAttribute('style','display:block')
      document.querySelector('.tab #tab-1')?.setAttribute('style','display:none')

      console.log("working ",document.querySelector('a')?.parentElement);
      document.querySelector('#current1')?.parentElement?.classList.add('current')
      document.querySelector('#current')?.parentElement?.classList.remove('current')
    }
      
  }

  onModelClose(){
    //console.log("working ", document.querySelector('#main-register-wrap'));
    document.querySelector('#main-register-wrap')?.setAttribute('style','display:none')
  }





  


  /* 
  show and hide model for sign in
*/
onOTPModel(){
  //console.log("working ", document.querySelector('#main-register-wrap'));
  document.querySelector('#main-otp-wrap')?.setAttribute('style','display:block')
}

hideModel(){
  document.querySelector('#main-otp-wrap')?.setAttribute('style','display:none')
}

onOTPModelClose(){
  document.querySelector('#main-otp-wrap')?.setAttribute('style','display:none');
}




onOTPSubmit(){
  this.loader = true;
  let mobileNo = localStorage.getItem('mobileNo');
  let password = localStorage.getItem('password');
  console.log("otp validate ", this.otpForm.value);
  let loginData = {"mobile": mobileNo, "password": password}
  
   if (this.otpForm.valid) {
    const otpDigits = [
      this.otpForm.value.digit1,
      this.otpForm.value.digit2,
      this.otpForm.value.digit3,
      this.otpForm.value.digit4
    ];

    let otnString = otpDigits.join('');
    console.log("otp validate otpEntered ",otnString );
    const data = {"mobile":mobileNo, "otp": otnString}
    
    if(mobileNo){
      this._service.validateOTP(data).subscribe({
        next: (res:any)=>{
          console.log("after matching otp ", res);
          if(res.status == "OK"){
            //close OTP Model
            this.onOTPModelClose();
            //loader close
            this.loader = false;
            Swal.fire({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              icon: 'success',
              timerProgressBar: false,
              timer: 20000,
              title: 'OTP Validate Successfully'
            })
            //call login method for login signup user
            this.getLoginAfterOTP(loginData);
           // this.route.navigate(['user']);
          }else{
            this.loader = false;
            Swal.fire({
              position: 'top',
              text: 'You have entered invalid OTP',
              icon: 'error',
              confirmButtonText: 'Ok'
            })
          }
          
        },
        error: (err:any)=>{
          this.loader = false;
          Swal.fire({
            position: 'top',
            text: err,
            icon: 'error',
            confirmButtonText: 'Ok'
          })
        }
      })
    }
    
  }else{
    console.log("Form not valid ",);
  } 
}


getLoginAfterOTP(data:any){
  if(data){
    this._service.getLogin(data).subscribe((res:any)=>{
      if(res.status == 'OK'){
        let token = res.result['api_token'];
        let user = res.result;
        localStorage.setItem('api_token', token);
        localStorage.setItem('userId', user.id);
        //set isLogin true;
        this._method.setLogin(true);
 
        //
        Swal.fire({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          icon: 'success',
          timerProgressBar: false,
          timer: 3000,
          title: 'Signed in successfully'
        })
        //remove mobile and pass
        localStorage.removeItem('mobileNo');
        localStorage.removeItem('password');
        //loader false
        this.loader = false;
      }
    })
  }
  
}


onInput(event: Event, nextControlName?: string) {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  if (value.length === 1 && nextControlName) {
    this.otpForm.controls[nextControlName].setValue('');
    const nextInput = document.querySelector(`[formControlName="${nextControlName}"]`) as HTMLInputElement;
    nextInput.focus();
  }
}

onKeyDown(event: KeyboardEvent, nextControlName: string) {
  if (event.key === 'Backspace' && event.target instanceof HTMLInputElement) {
    const input = event.target as HTMLInputElement;

    if (input.value === '') {
      const previousInput = document.querySelector(`[formControlName="${nextControlName}"]`) as HTMLInputElement;
      previousInput.focus();
    }
  }
}


onMobileModel(){
  //console.log("working ", document.querySelector('#main-register-wrap'));
  document.querySelector('#main-mobile-wrap')?.setAttribute('style','display:block')
}

hideMobileModel(){
  document.querySelector('#main-mobile-wrap')?.setAttribute('style','display:none')
}

onMobileModelClose(){
  document.querySelector('#main-mobile-wrap')?.setAttribute('style','display:none');
}


onChildAgeModel(){
  //console.log("working ", document.querySelector('#main-register-wrap'));
  document.querySelector('#main-child-age-wrap')?.setAttribute('style','display:block');
  this.generateChildAges();
}

hideChildAgeModel(){
  document.querySelector('#main-child-age-wrap')?.setAttribute('style','display:none')
}

onChildAgeModelClose(){
  document.querySelector('#main-child-age-wrap')?.setAttribute('style','display:none');
}

// Getter for accessing child ages form array
get childAgesArray() {
  return this.childForm?.get('childAges') as FormArray;
}

// Method to generate child age form controls based on the selected number of children
generateChildAges() {
  const childArray = JSON.parse(localStorage.getItem('child_age') || '[]');
  if(childArray.length > 0 && this.childrenQuantity !=0) {
    //console.log("working age ", this.childrenQuantity);
    const formArray = this.childForm?.get('childAges') as FormArray;
    formArray.clear();
    // Patch the retrieved child age values into the form array
    for(let i=0; i< this.childrenQuantity; i++){
      formArray.push(this.fb.control(childArray[i], [Validators.required, Validators.max(17)]));
    }
  } else {
    // Clear existing form controls if no child age values are found
    const formArray = this.childForm.get('childAges') as FormArray;
    formArray.clear();

    // Add form control for each child age
    for (let i = 0; i < this.childrenQuantity; i++) {
      formArray.push(this.fb.control(null, [Validators.required, Validators.max(17)]));
    }
  }
}

// Method to handle change in the number of children
onNumberOfChildrenChange() {
  this.generateChildAges(); // Generate child age form controls
}

  save_child(){
    const child = this.childAgesArray?.value;
    console.log("child ages ", this.childAgesArray, child)
    localStorage.setItem("child_age", JSON.stringify(child));
    this.onChildAgeModelClose();
  }

}


