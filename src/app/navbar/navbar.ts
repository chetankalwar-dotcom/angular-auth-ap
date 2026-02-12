import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.html',
    styleUrl: './navbar.css',
})
export class Navbar {
    user: any;

    constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
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
