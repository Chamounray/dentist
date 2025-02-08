export interface AppointmentTableData {
  _id: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'checkup' | 'treatment' | 'emergency' | 'consultation';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  patientName: string;
  notes?: string;
} 