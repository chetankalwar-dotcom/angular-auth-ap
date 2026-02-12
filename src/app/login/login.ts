


import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../core/services/auth';
  

@Component({
  
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [Auth]
})
export class Login  {

 email:any;
 password:any;
constructor(private auth:Auth, private router:Router){}

login(){

  this.auth.login(this.email,this.password)
  .subscribe((res:any)=>{

   if(res.length>0){
    localStorage.setItem("user",JSON.stringify(res[0]));
    this.router.navigate(['/dashboard']);
   }else{
    alert("Invalid Login");
   }

  });

 }


}
