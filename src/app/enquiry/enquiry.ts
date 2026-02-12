import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../core/services/auth';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-enquiry',
    standalone: true,
    imports: [FormsModule, RouterModule, Navbar, CommonModule],
    templateUrl: './enquiry.html',
    styleUrl: './enquiry.css',
})
export class Enquiry implements OnInit {
    enquiry: any = {
        productName: '',
        description: '',
        contact: '',
        status: 'Pending',
        userId: '',
        userName: ''
    };

    otpSent: boolean = false;
    otpVerified: boolean = false;
    enteredOtp: string = '';
    generatedOtp: string = '';

    constructor(private auth: Auth, private router: Router) { }

    ngOnInit() {
        if (typeof window !== 'undefined' && window.localStorage) {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                this.enquiry.userId = user.id;
                this.enquiry.userName = user.name;
            }
        }
    }

    sendOtp() {
        if (!this.enquiry.contact) {
            alert("Please enter a contact number first.");
            return;
        }
        // Generate a 4-digit mock OTP
        this.generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
        alert(`Your OTP is: ${this.generatedOtp}`);
        this.otpSent = true;
    }

    verifyOtp() {
        if (this.enteredOtp === this.generatedOtp) {
            this.otpVerified = true;
            alert("OTP Verified Successfully!");
        } else {
            alert("Invalid OTP. Please try again.");
        }
    }

    submitEnquiry() {
        if (!this.enquiry.productName || !this.enquiry.description || !this.enquiry.contact) {
            alert("Please fill in all required fields.");
            return;
        }

        if (!this.otpVerified) {
            alert("Please verify your contact number with OTP.");
            return;
        }

        this.auth.submitEnquiry(this.enquiry).subscribe({
            next: () => {
                alert("Enquiry submitted successfully!");
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                alert("Error submitting enquiry");
                console.error(err);
            }
        })
    }
}
