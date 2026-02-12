import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../core/services/auth';
import { Navbar } from '../navbar/navbar';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-enquiry-list',
    standalone: true,
    imports: [CommonModule, Navbar, FormsModule],
    templateUrl: './enquiry-list.html',
    styleUrl: './enquiry-list.css',
})
export class EnquiryList implements OnInit {
    enquiries$!: Observable<any>;
    selectedEnquiry: any = null;
    isModalOpen: boolean = false;
    newStatus: string = '';

    constructor(private auth: Auth) { }

    ngOnInit() {
        this.loadEnquiries();
    }

    loadEnquiries() {
        this.enquiries$ = this.auth.getEnquiries();
    }

    openStatusModal(enquiry: any) {
        this.selectedEnquiry = enquiry;
        this.newStatus = enquiry.status; // Initialize with current status
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.selectedEnquiry = null;
    }

    updateStatus() {
        if (this.selectedEnquiry) {
            this.auth.updateEnquiryStatus(this.selectedEnquiry.id, this.newStatus).subscribe({
                next: () => {
                    alert("Status updated successfully!");
                    this.closeModal();
                    this.loadEnquiries(); // Refresh list
                },
                error: (err) => {
                    alert("Error updating status");
                    console.error(err);
                }
            })
        }
    }
}
