import { Component, ChangeDetectorRef, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Auth } from '../core/services/auth';
import { Navbar } from '../navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { interval, Subscription, BehaviorSubject, Observable } from 'rxjs';
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
    photoPreview: string | null = null;
    photoSizeError: boolean = false;

    otpSent: boolean = false;
    otpVerified: boolean = false;
    enteredOtp: string = '';
    generatedOtp: string = '';

    timeLeft$ = new BehaviorSubject<number>(30);
    timerInterval: any;
    isResendEnabled$ = new BehaviorSubject<boolean>(false);

    constructor(
        private auth: Auth,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private zone: NgZone,
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
            testCenter: [{ value: '', disabled: true }, [Validators.required]],
            studentPhoto: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadFormData();
        }
    }

    ngOnDestroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    loadFormData() {
        this.auth.getExamPhases().subscribe((res: any) => this.examPhases = res);
        this.auth.getCities().subscribe((res: any) => this.cities = res);
    }

    onCityChange() {
        const cityControl = this.registrationForm.get('city');
        const centerControl = this.registrationForm.get('testCenter');

        if (cityControl?.value) {
            const selectedCity = this.cities.find(c => c.name === cityControl.value);
            this.centers = selectedCity ? selectedCity.centers : [];
            centerControl?.enable();
        } else {
            this.centers = [];
            centerControl?.disable();
        }
        this.registrationForm.patchValue({ testCenter: '' });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }

            // Validate size (max 1MB)
            if (file.size > 1 * 1024 * 1024) {
                this.photoSizeError = true;
                this.photoPreview = null;
                this.registrationForm.patchValue({ studentPhoto: '' });
                return;
            }
            this.photoSizeError = false;

            const reader = new FileReader();
            reader.onload = () => {
                console.log('FileReader loaded successfully');
                this.zone.run(() => {
                    console.log('Updating photoPreview in NgZone');
                    this.photoPreview = reader.result as string;
                    this.registrationForm.patchValue({
                        studentPhoto: this.photoPreview
                    });
                    this.registrationForm.get('studentPhoto')?.updateValueAndValidity();
                    console.log('Triggering detectChanges');
                    this.cdr.detectChanges();
                });
            };
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
            };
            reader.readAsDataURL(file);
        }
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
        this.timeLeft$.next(30);
        this.isResendEnabled$.next(false);
        console.log('Timer started, timeLeft: 30');

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            this.zone.run(() => {
                const current = this.timeLeft$.value;
                if (current > 0) {
                    const nextValue = current - 1;
                    this.timeLeft$.next(nextValue);
                    console.log('Timer tick, timeLeft:', nextValue);
                } else {
                    this.isResendEnabled$.next(true);
                    console.log('Timer expired!');
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
            });
        }, 1000);
    }

    logFormErrors() {
        console.log("=== Form Validation Status ===");
        Object.keys(this.registrationForm.controls).forEach(key => {
            const control = this.registrationForm.get(key);
            if (control?.invalid) {
                console.log(`Control: ${key}, Errors:`, control.errors);
            }
        });
        console.log("Form Validity:", this.registrationForm.valid);
        console.log("OTP Verified:", this.otpVerified);
        console.log("Timer Value:", this.timeLeft$.value);
    }

    verifyOtp() {
        const trimmedOtp = this.enteredOtp.trim();
        console.log('Entered OTP:', trimmedOtp, 'Type:', typeof trimmedOtp);
        console.log('Generated OTP:', this.generatedOtp, 'Type:', typeof this.generatedOtp);
        console.log('Match:', trimmedOtp === this.generatedOtp);

        if (trimmedOtp === this.generatedOtp) {
            this.otpVerified = true;
            this.registrationForm.get('contact')?.disable();
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            alert("OTP Verified Successfully!");
        } else {
            alert(`Invalid OTP. Please try again.\nYou entered: "${trimmedOtp}"\nExpected: "${this.generatedOtp}"`);
        }
    }

    register() {
        debugger
        if (this.registrationForm.invalid) {
            this.logFormErrors();
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
