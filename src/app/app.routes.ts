import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Signup } from './signup/signup';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard },
    { path: 'signup', component: Signup },
    { path: 'edit-profile', loadComponent: () => import('./edit-profile/edit-profile').then(m => m.EditProfile) },
    { path: 'enquiry', loadComponent: () => import('./enquiry/enquiry').then(m => m.Enquiry) },
    { path: 'enquiry-list', loadComponent: () => import('./enquiry-list/enquiry-list').then(m => m.EnquiryList) },
    { path: 'mock-test', loadComponent: () => import('./mock-test/mock-test').then(m => m.MockTest) },
    { path: 'mock-test-list', loadComponent: () => import('./mock-test-list/mock-test-list').then(m => m.MockTestList) }
];
