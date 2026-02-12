import { Component, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Auth } from '../core/services/auth';
import { Navbar } from '../navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-mock-test',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Navbar, CommonModule],
    templateUrl: './mock-test.html',
    styleUrl: './mock-test.css'
})
export class MockTest {
    registrationForm: FormGroup;

    cities: any[] = [];
    examPhases: any[] = [];
    centers: string[] = [];

    otpSent: boolean = false;
    otpVerified: boolean = false;
    enteredOtp: string = '';
    generatedOtp: string = '';

    timeLeft: number = 30;
    timerSubscription?: Subscription;
    isResendEnabled: boolean = false;

    constructor(
        private auth: Auth,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.registrationForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]],
            fatherName: ['', [Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]*$/)]],
            motherName: ['', [Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]*$/)]],
            contact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
            email: ['', [Validators.email]],
            school: ['', [Validators.minLength(3)]],
            board: ['', [Validators.required]],
            stream: ['', [Validators.required]],
            city: ['', [Validators.required]],
            examPhase: ['', [Validators.required]],
            testCenter: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadFormData();
        }
    }

    ngOnDestroy() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    loadFormData() {
        this.auth.getExamPhases().subscribe((res: any) => this.examPhases = res);
        this.auth.getCities().subscribe((res: any) => this.cities = res);
    }

    onCityChange() {
        const cityValue = this.registrationForm.get('city')?.value;
        const selectedCity = this.cities.find(c => c.name === cityValue);
        this.centers = selectedCity ? selectedCity.centers : [];
        this.registrationForm.patchValue({ testCenter: '' }); // Reset center when city changes
    }

    sendOtp() {
        const contactControl = this.registrationForm.get('contact');
        if (!contactControl?.value || contactControl.invalid) {
            alert("Please enter a valid 10-digit contact number first.");
            return;
        }
        // Generate a 4-digit mock OTP
        this.generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
        alert(`Your OTP is: ${this.generatedOtp}`);
        this.otpSent = true;
        this.startTimer();
    }

    resendOtp() {
        this.sendOtp();
    }

    startTimer() {
        this.timeLeft = 30;
        this.isResendEnabled = false;
        console.log('Timer started, timeLeft:', this.timeLeft, 'isResendEnabled:', this.isResendEnabled);

        // Unsubscribe from previous timer if exists
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }

        // Use RxJS interval for better Angular integration
        this.timerSubscription = interval(1000).pipe(take(31)).subscribe(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                console.log('Timer tick, timeLeft:', this.timeLeft);
                this.cdr.markForCheck(); // Force change detection
            } else {
                this.isResendEnabled = true;
                console.log('Timer expired! isResendEnabled:', this.isResendEnabled);
                this.cdr.markForCheck(); // Force change detection
                if (this.timerSubscription) {
                    this.timerSubscription.unsubscribe();
                }
            }
        });
    }

    verifyOtp() {
        const trimmedOtp = this.enteredOtp.trim();
        console.log('Entered OTP:', trimmedOtp, 'Type:', typeof trimmedOtp);
        console.log('Generated OTP:', this.generatedOtp, 'Type:', typeof this.generatedOtp);
        console.log('Match:', trimmedOtp === this.generatedOtp);

        if (trimmedOtp === this.generatedOtp) {
            this.otpVerified = true;
            if (this.timerSubscription) {
                this.timerSubscription.unsubscribe();
            }
            alert("OTP Verified Successfully!");
        } else {
            alert(`Invalid OTP. Please try again.\nYou entered: "${trimmedOtp}"\nExpected: "${this.generatedOtp}"`);
        }
    }

    register() {
        if (this.registrationForm.invalid) {
            alert("Please fill all required fields correctly!");
            this.registrationForm.markAllAsTouched();
            return;
        }

        if (!this.otpVerified) {
            alert("Please verify your contact number with OTP.");
            return;
        }

        this.auth.registerMockTest(this.registrationForm.value).subscribe({
            next: () => {
                alert("Registration Successful! You can download your admit card from the dashboard.");
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                console.error(err);
                alert("Registration Failed");
            }
        })
    }
}
