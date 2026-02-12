import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.html',
    styleUrl: './navbar.css',
})
export class Navbar {
    user: any;

    constructor(private router: Router) { }

    ngOnInit() {
        if (typeof window !== 'undefined' && window.localStorage) {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                this.user = JSON.parse(userStr);
            }
        }
    }

    logout() {
        localStorage.removeItem("user");
        this.router.navigate(['/login']);
    }
}
