import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  api = "http://localhost:3001/users";

  constructor(private http: HttpClient) { }

  login(email: any, password: any) {
    return this.http.get(`${this.api}?email=${email}&password=${password}`);
  }

  signup(data: any) {
    return this.http.post(this.api, data);
  }

  getUser(id: string) {
    return this.http.get(`${this.api}/${id}`);
  }

  updateProfile(id: string, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  submitEnquiry(data: any) {
    return this.http.post("http://localhost:3001/enquiries", data);
  }

  getEnquiries() {
    return this.http.get("http://localhost:3001/enquiries");
  }

  updateEnquiryStatus(id: string, status: string) {
    return this.http.patch(`http://localhost:3001/enquiries/${id}`, { status: status });
  }

  registerMockTest(data: any) {
    return this.http.post("http://localhost:3001/mockTests", data);
  }

  getMockTests() {
    return this.http.get("http://localhost:3001/mockTests");
  }

  getExamPhases() {
    return this.http.get("http://localhost:3001/examPhases");
  }

  getCities() {
    return this.http.get("http://localhost:3001/cities");
  }
}
