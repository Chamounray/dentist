export interface Patient {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  allergies: Array<{
    _id: string;
    allergen: string;
    severity: 'mild' | 'moderate' | 'severe';
    notes?: string;
  }>;
  medicalHistory: Array<{
    _id: string;
    condition: string;
    diagnosedDate: Date;
    notes?: string;
    status: 'active' | 'resolved' | 'managed';
  }>;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  documents?: Array<{
    type: string;
    title: string;
    fileUrl: string;
    notes?: string;
    uploadDate: Date;
  }>;
  teeth?: Array<{
    number: number;
    condition: string;
    treatments: Array<{
      type: string;
      date: Date;
      description: string;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}