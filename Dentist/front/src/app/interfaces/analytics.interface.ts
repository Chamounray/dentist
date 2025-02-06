export interface Analytics {
  totalPatients: number;
  todayAppointments: number;
  pendingTreatments: number;
  completedTreatments: number;
  appointmentMetrics: {
    completed: number;
    cancelled: number;
    noShow: number;
    scheduled: number;
  };
  appointmentsByType: Array<{
    _id: string;
    count: number;
  }>;
  monthlyAppointments: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }>;
  treatmentProcedures: Array<{
    _id: string;
    count: number;
    avgCost: number;
  }>;
  analytics: any[];
  trends: {
    appointmentGrowth: number;
    patientGrowth: number;
    treatmentSuccess: number;
  } | null;
}