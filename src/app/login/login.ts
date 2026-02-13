


import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../core/services/auth';


@Component({

  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [Auth]
})
export class Login implements OnInit {

  email: any = '';
  password: any = '';
  rememberMe: boolean = false;

  constructor(
    private auth: Auth,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedAuth = localStorage.getItem('remembered_auth');
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          this.email = authData.email;
          this.password = authData.password;
          this.rememberMe = true;
        } catch (e) {
          console.error('Error parsing remembered credentials', e);
        }
      }
    }
  }

  login() {

    this.auth.login(this.email, this.password)
      .subscribe((res: any) => {
        debugger;
        if (res.length > 0) {
          if (this.rememberMe) {
            localStorage.setItem('remembered_auth', JSON.stringify({
              email: this.email,
              password: this.password
            }));
          } else {
            localStorage.removeItem('remembered_auth');
          }

          localStorage.setItem("user", JSON.stringify(res[0]));
          this.router.navigate(['/dashboard']);
        } else {
          alert("Invalid Login");
        }

      });

  }


}
