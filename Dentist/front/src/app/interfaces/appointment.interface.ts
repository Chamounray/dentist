import { Patient } from "./patient.interface";
import { User } from "./user.interface";

export interface Appointment {
    _id: string;
    patient: string;
    dentist: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    type: 'checkup' | 'treatment' | 'emergency' | 'consultation';
    notes?: string;
    treatmentPlan?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type AppointmentType = 'checkup' | 'cleaning' | 'filling' | 'root-canal' | 'extraction' | 'other';
  export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  
  export interface AppointmentRequest {
    patientId: string;
    dateTime: Date;
    duration: number;
    type: AppointmentType;
    notes?: string;
  }