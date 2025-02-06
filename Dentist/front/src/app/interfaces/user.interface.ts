export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'dentist' | 'patient' | 'admin';
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterUserData extends UserCredentials {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'dentist' | 'patient';
  }