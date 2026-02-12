import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../core/services/auth';
import { Navbar } from '../navbar/navbar';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mock-test-list',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './mock-test-list.html',
  styleUrl: './mock-test-list.css'
})
export class MockTestList implements OnInit {
  students$!: Observable<any[]>;

  constructor(private auth: Auth) { }

  ngOnInit() {
    this.students$ = this.auth.getMockTests() as Observable<any[]>;
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
          <div class="details">
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Father's Name:</strong> ${student.fatherName}</p>
            <p><strong>Mother's Name:</strong> ${student.motherName}</p>
            <p><strong>Board:</strong> ${student.board}</p>
            <p><strong>Stream:</strong> ${student.stream}</p>
            <p><strong>School:</strong> ${student.school}</p>
            <p><strong>Exam Center:</strong> Allen Career Institute, ${student.city}</p>
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
