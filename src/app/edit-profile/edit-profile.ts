import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../core/services/auth';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [FormsModule, RouterModule, Navbar],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {
  user: any = {
    name: '',
    email: '',
    password: '',
    role: 'USER'
  };

  constructor(private auth: Auth, private router: Router) { }

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = localStorage.getItem('user');
      if (user) {
        this.user = JSON.parse(user);
      }
    }
  }

  updateProfile() {
    if (this.user && this.user.id) {
      this.auth.updateProfile(this.user.id, this.user).subscribe({
        next: () => {
          alert("Profile updated successfully");
          // Update local storage if needed
          localStorage.setItem('user', JSON.stringify(this.user));
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          alert("Error updating profile");
          console.error(err);
        }
      })
    } else {
      alert("No user ID found to update");
    }
  }
}
