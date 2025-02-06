import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component')
      .then(m => m.RegisterComponent)
  },
  
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
 
  {
    path: 'patients',
    loadComponent: () => import('./components/patients/patient-list/patient-list.component')
      .then(m => m.PatientListComponent),
    canActivate: [authGuard]
  },
   
  {
    path: 'patients/:id',
    loadComponent: () => import('./components/patients/patient-details/patient-details.component')
      .then(m => m.PatientDetailsComponent),
    canActivate: [authGuard]
  },
  
  {
    path: 'appointments',
    loadComponent: () => import('./components/patients/patient-appointments/patient-appointments.component')
      .then(m => m.PatientAppointmentsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'treatment-plans',
    loadComponent: () => import('./components/patients/patient-treatment-plans/patient-treatment-plans.component')
      .then(m => m.PatientTreatmentPlansComponent),
    canActivate: [authGuard]
  },
  
  {
    path: 'dentist-availability',
    loadComponent: () => import('./components/dentist/dentist-availability/dentist-availability.component')
      .then(m => m.DentistAvailabilityComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dentist-appointments',
    loadComponent: () => import('./components/dentist/dentist-appointments/dentist-appointments.component')
      .then(m => m.DentistAppointmentsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dentist-treatment-plans',
    loadComponent: () => import('./components/dentist/dentist-treatment-plans/dentist-treatment-plans.component')
      .then(m => m.DentistTreatmentPlansComponent),
    canActivate: [authGuard]
  },
  /*
  {
    path: '',

    redirectTo: '/dashboard',
    pathMatch: 'full'
  }*/
];