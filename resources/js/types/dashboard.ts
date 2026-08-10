export interface DashboardStats {
  date: string;
  patients: PatientStats;
  visits: VisitStats;
  queue: QueueStats;
  consultations: ConsultationStats;
  prescriptions: PrescriptionStats;
  pharmacy: PharmacyStats;
  laboratory: LaboratoryStats;
  billing: BillingStats;
  payments: PaymentStats;
  recentPatients: RecentPatient[];
  waitingQueue: WaitingQueueEntry[];
  activeConsultations: ActiveConsultation[];
}

export interface PatientStats {
  total_today: number;
}

export interface VisitStats {
  total: number;
  waiting: number;
  in_consultation: number;
  completed: number;
  cancelled: number;
}

export interface QueueStats {
  waiting: number;
  called: number;
  in_progress: number;
}

export interface ConsultationStats {
  total_today: number;
  in_progress: number;
}

export interface PrescriptionStats {
  total_today: number;
  pending_dispensing: number;
  dispensed_today: number;
}

export interface PharmacyStats {
  low_stock: number;
  expired: number;
  expiring_soon: number;
}

export interface LaboratoryStats {
  ordered_today: number;
  in_progress: number;
  completed_today: number;
  pending_results: number;
}

export interface BillingStats {
  generated_today: number;
  unpaid: number;
  partially_paid: number;
  paid_today: number;
  total_invoiced: number;
  outstanding: number;
}

export interface PaymentStats {
  total_collected: number;
  cash_total: number;
  mpesa_total: number;
  cash_transactions: number;
  mpesa_transactions: number;
}

export interface RecentPatient {
  id: number;
  patient_name: string;
  phone: string | null;
  visit_status: string;
  time_registered: string;
  visit_id: number;
}

export interface WaitingQueueEntry {
  id: number;
  patient_name: string;
  position: number;
  visit_id: number;
  waiting_minutes: number;
}

export interface ActiveConsultation {
  id: number;
  patient_name: string;
  visit_id: number;
  consultation_id: number;
  start_time: string;
  visit_status: string;
}
