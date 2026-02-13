import { Component, OnInit, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Auth } from '../core/services/auth';
import { Navbar } from '../navbar/navbar';
import { Observable, forkJoin, BehaviorSubject, switchMap, of } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-mock-test-list',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './mock-test-list.html',
  styleUrl: './mock-test-list.css'
})
export class MockTestList implements OnInit {
  private refreshStudents = new BehaviorSubject<void>(undefined);
  students$: Observable<any[]>;
  isUploading: boolean = false;
  uploadStatus: { message: string, type: 'success' | 'danger' } | null = null;

  constructor(
    private auth: Auth,
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.students$ = this.refreshStudents.pipe(
      switchMap(() => {
        if (isPlatformBrowser(this.platformId)) {
          return this.auth.getMockTests() as Observable<any[]>;
        }
        return of([]);
      })
    );
  }

  ngOnInit() {
    // Initial load is handled by BehaviorSubject
  }

  downloadSampleExcel() {
    const data = [{
      'Name': 'John Doe',
      'Father\'s Name': 'Robert Doe',
      'Mother\'s Name': 'Mary Doe',
      'Email': 'john@example.com',
      'School': 'Central High',
      'Board': 'CBSE',
      'Stream': 'Science',
      'Contact': '9876543210',
      'City': 'Kota',
      'Center': 'Allen Samyak',
      'Phase': 'Phase 1 - April 2026'
    }];

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'sample_bulk_registration.xlsx');
  }

  loadStudents() {
    this.refreshStudents.next();
    this.cdr.detectChanges();
  }

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) return;

    this.isUploading = true;
    this.uploadStatus = null;
    this.cdr.detectChanges();

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      this.zone.run(() => {
        try {
          const bstr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
          const wsname: string = wb.SheetNames[0];
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);

          this.processBulkData(data);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          this.uploadStatus = { message: 'Error parsing Excel file', type: 'danger' };
          this.isUploading = false;
          this.cdr.detectChanges();
        }
      });
    };
    reader.onerror = (error) => {
      this.zone.run(() => {
        console.error('FileReader error:', error);
        this.uploadStatus = { message: 'Error reading file', type: 'danger' };
        this.isUploading = false;
        this.cdr.detectChanges();
      });
    };
    reader.readAsBinaryString(target.files[0]);
    // Clear input
    event.target.value = '';
  }

  processBulkData(data: any[]) {
    if (data.length === 0) {
      this.uploadStatus = { message: 'Excel file is empty', type: 'danger' };
      this.isUploading = false;
      this.cdr.detectChanges();
      return;
    }

    const registrations = data.map(item => ({
      name: item['Name'] || '',
      fatherName: item["Father's Name"] || '',
      motherName: item["Mother's Name"] || '',
      email: item['Email'] || '',
      school: item['School'] || '',
      board: item['Board'] || '',
      stream: item['Stream'] || '',
      contact: item['Contact'] || '',
      city: item['City'] || '',
      testCenter: item['Center'] || '',
      examPhase: item['Phase'] || '',
      studentPhoto: '', // Placeholder for bulk upload
      registrationDate: new Date().toISOString()
    }));

    const requests = registrations.map(reg => this.auth.registerMockTest(reg));

    forkJoin(requests).subscribe({
      next: () => {
        this.zone.run(() => {
          this.uploadStatus = { message: `Successfully registered ${registrations.length} students`, type: 'success' };
          this.loadStudents();
          this.isUploading = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.zone.run(() => {
              this.uploadStatus = null;
              this.cdr.detectChanges();
            });
          }, 5000 * 2); // Increased timeout to be sure
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error('Bulk upload error:', err);
          this.uploadStatus = { message: 'Error during bulk registration', type: 'danger' };
          this.isUploading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  downloadAdmitCard(student: any) {
    const admitCardContent = `
      <html>
        <head>
          <title>Admit Card - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; border: 2px solid #000; max-width: 600px; margin: auto; }
            h1 { text-align: center; color: #d32f2f; }
            .details { margin-top: 20px; }
            .details p { font-size: 16px; margin: 5px 0; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Board Mock Test 2026</h1>
          <h2 style="text-align:center;">Admit Card</h2>
          <hr>
          <div class="details" style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <p><strong>Name:</strong> ${student.name}</p>
              <p><strong>Father's Name:</strong> ${student.fatherName}</p>
              <p><strong>Mother's Name:</strong> ${student.motherName}</p>
              <p><strong>Board:</strong> ${student.board}</p>
              <p><strong>Stream:</strong> ${student.stream}</p>
              <p><strong>School:</strong> ${student.school}</p>
              <p><strong>Exam Center:</strong> Allen Career Institute, ${student.city}</p>
            </div>
            <div style="border: 1px solid #000; width: 120px; height: 150px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              <img src="${student.studentPhoto}" style="max-width: 100%; max-height: 100%;" alt="Photo">
            </div>
          </div>
          <div class="footer">
            <p>Please bring this admit card to the exam center.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const popupWin = window.open('', '_blank', 'width=600,height=600');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(admitCardContent);
      popupWin.document.close();
    } else {
      alert("Please allow popups to download Admit Card");
    }
  }
}
