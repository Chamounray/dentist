import { User } from "./user.interface";

export interface Notification {
    id: string;
    recipient: User;
    type: NotificationType;
    title: string;
    message: string;
    relatedTo?: {
      model: 'Appointment' | 'TreatmentPlan' | 'Patient';
      id: string;
    };
    read: boolean;
    scheduledFor: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type NotificationType = 'appointment_reminder' | 'treatment_update' | 'document_added' | 'general';