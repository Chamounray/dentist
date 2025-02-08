import { Patient } from "./patient.interface";
import { User } from "./user.interface";

export interface TreatmentProcedure {
  _id: string;
  name: string;
  description?: string;
  tooth?: string;
  status: 'pending' | 'completed' | 'cancelled';
  cost: number;
  notes?: string;
  completedDate?: Date;
}

export interface TreatmentPlan {
  _id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'cancelled';
  procedures: TreatmentProcedure[];
  totalCost: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentStep {
  id: string;
  procedure: string;
  description?: string;
  estimatedCost: number;
  status: TreatmentStepStatus;
  plannedDate?: Date;
  completedDate?: Date;
  notes?: string;
  attachments: StepAttachment[];
}

export interface StepAttachment {
  title: string;
  fileUrl: string;
  uploadDate: Date;
}

export type TreatmentPlanStatus = 'active' | 'completed' | 'cancelled';
export type TreatmentStepStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';  