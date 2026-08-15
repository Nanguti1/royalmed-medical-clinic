export type Appointment = {
    id: number;
    patient_id: number;
    doctor_id: number | null;
    dental_chair_id: number | null;
    visit_id: number | null;
    consultation_id: number | null;
    appointment_date: string;
    start_time: string;
    end_time: string;
    appointment_type: 'consultation' | 'procedure' | 'follow_up' | 'walk_in';
    reason: string | null;
    notes: string | null;
    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'waitlisted';
    is_walk_in: boolean;
    is_follow_up: boolean;
    schedule_reminder: boolean;
    reminder_type: 'sms' | 'email' | null;
    created_by: number | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    doctor?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    dentalChair?: {
        id: number;
        chair_name: string;
    };
    visit?: {
        id: number;
        visit_date: string;
    };
    consultation?: {
        id: number;
        diagnosis: string | null;
    };
    reminders?: AppointmentReminder[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type AppointmentReminder = {
    id: number;
    appointment_id: number;
    reminder_type: 'sms' | 'email';
    is_sent: boolean;
    sent_at: string | null;
    message: string | null;
    created_at: string;
};

export type DoctorSchedule = {
    id: number;
    doctor_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    notes: string | null;
    doctor?: {
        id: number;
        first_name: string;
        last_name: string;
    };
};

export type DentalChairSchedule = {
    id: number;
    chair_name: string;
    location: string | null;
    description: string | null;
    is_active: boolean;
    schedules?: DentalChairScheduleSlot[];
};

export type DentalChairScheduleSlot = {
    id: number;
    dental_chair_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
};

export type AppointmentFormData = {
    patient_id: number;
    doctor_id?: number;
    dental_chair_id?: number;
    visit_id?: number;
    consultation_id?: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
    appointment_type: 'consultation' | 'procedure' | 'follow_up' | 'walk_in';
    reason?: string;
    notes?: string;
    is_walk_in?: boolean;
    is_follow_up?: boolean;
    schedule_reminder?: boolean;
    reminder_type?: 'sms' | 'email';
};

export type AppointmentFilters = {
    date?: string;
    doctor_id?: number;
    status?: string;
};
