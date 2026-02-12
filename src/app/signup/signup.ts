import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../core/services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,   // ⭐ VERY IMPORTANT
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']   // ⭐ plural
})
export class Signup {

 user:any={ role:'USER' };

 constructor(private auth:Auth, private router:Router){}

 signup(){
  this.auth.signup(this.user).subscribe(()=>{
   alert("Signup Success");
   this.router.navigate(['/login']);
  })
 }

}
