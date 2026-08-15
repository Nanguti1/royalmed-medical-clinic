export type Vaccine = {
    id: number;
    name: string;
    code: string;
    manufacturer: string;
    type: string;
    description: string | null;
    recommended_age: string | null;
    dosage_schedule: string | null;
    storage_requirements: string | null;
    contraindications: string | null;
    side_effects: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type VaccinationRecord = {
    id: number;
    patient_id: number;
    vaccine_id: number;
    visit_id: number | null;
    record_number: string;
    administration_date: string;
    dose_number: number;
    batch_number: string | null;
    expiry_date: string | null;
    site: 'left_arm' | 'right_arm' | 'thigh';
    route: 'intramuscular' | 'subcutaneous' | 'oral' | 'nasal';
    dosage: number | null;
    dosage_unit: string | null;
    reactions: string | null;
    notes: string | null;
    status: 'scheduled' | 'administered' | 'completed' | 'skipped' | 'cancelled';
    administered_by: number | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
        date_of_birth: string;
    };
    vaccine?: Vaccine;
    administeredBy?: {
        id: number;
        name: string;
    };
    reminders?: VaccinationReminder[];
    certificates?: VaccinationCertificate[];
    created_at: string;
    updated_at: string;
};

export type VaccinationCertificate = {
    id: number;
    patient_id: number;
    vaccination_record_id: number;
    certificate_number: string;
    valid_from: string;
    valid_until: string | null;
    issuing_authority: string;
    issuer_name: string;
    issuer_license: string | null;
    qr_code: string | null;
    created_by: number | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
        date_of_birth: string;
    };
    vaccinationRecord?: {
        id: number;
        administration_date: string;
        vaccine?: Vaccine;
    };
    createdBy?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type VaccinationReminder = {
    id: number;
    patient_id: number;
    vaccination_record_id: number | null;
    scheduled_date: string;
    reminder_type: string;
    message: string;
    status: 'pending' | 'sent' | 'failed';
    sent_at: string | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    vaccinationRecord?: {
        id: number;
        administration_date: string;
        vaccine?: Vaccine;
    };
    created_at: string;
    updated_at: string;
};

export type VaccinationSchedule = {
    age_months: number;
    required_vaccines: Array<{
        vaccine: Vaccine;
        recommended_age: string;
        dose_number: number;
    }>;
};
