export type Gender = {
    id: number;
    code: string;
    name: string;
};

export type County = {
    id: number;
    name: string;
};

export type SubCounty = {
    id: number;
    county_id: number;
    name: string;
};

export type PatientIdentifier = {
    id: number;
    patient_id: number;
    identifier_type: string;
    identifier_value: string;
    is_primary: boolean;
};

export type PatientContact = {
    id: number;
    patient_id: number;
    contact_type: string;
    contact_value: string;
    is_primary: boolean;
};

export type PatientAddress = {
    id: number;
    patient_id: number;
    address_type: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    postal_code: string | null;
    is_primary: boolean;
};

export type EmergencyContact = {
    id: number;
    patient_id: number;
    name: string;
    relationship: string;
    phone: string;
    address: string | null;
};

export type PatientAllergy = {
    id: number;
    patient_id: number;
    allergen: string;
    severity: string;
    reaction: string | null;
    recorded_by: number | null;
    recorded_at: string;
};

export type PatientChronicCondition = {
    id: number;
    patient_id: number;
    condition_name: string;
    diagnosis_date: string | null;
    status: string;
    notes: string | null;
    recorded_by: number | null;
    recorded_at: string;
};

export type PatientAlert = {
    id: number;
    patient_id: number;
    alert_type: string;
    message: string;
    severity: string;
    is_active: boolean;
    created_by: number | null;
    created_at: string;
};

export type PatientRelationship = {
    id: number;
    patient_id: number;
    related_patient_id: number;
    relationship_type: string;
    related_patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
};

export type Patient = {
    id: number;
    hospital_number: string;
    first_name: string;
    last_name: string;
    other_names: string | null;
    gender_id: number | null;
    date_of_birth: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    county_id: number | null;
    sub_county_id: number | null;
    notes: string | null;
    photo_path: string | null;
    occupation: string | null;
    employer: string | null;
    marital_status: string | null;
    preferred_language: string | null;
    religion: string | null;
    blood_group: string | null;
    gender?: Gender | null;
    county?: County | null;
    sub_county?: SubCounty | null;
    identifiers?: PatientIdentifier[];
    contacts?: PatientContact[];
    addresses?: PatientAddress[];
    emergencyContacts?: EmergencyContact[];
    allergies?: PatientAllergy[];
    chronicConditions?: PatientChronicCondition[];
    alerts?: PatientAlert[];
    relationships?: PatientRelationship[];
    activeAlerts?: PatientAlert[];
    activeAllergies?: PatientAllergy[];
    activeChronicConditions?: PatientChronicCondition[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type PatientFormData = {
    first_name: string;
    last_name: string;
    other_names?: string;
    gender_id?: number;
    date_of_birth?: string;
    phone?: string;
    email?: string;
    address?: string;
    county_id?: number;
    sub_county_id?: number;
    notes?: string;
    occupation?: string;
    employer?: string;
    marital_status?: string;
    preferred_language?: string;
    religion?: string;
    blood_group?: string;
    identifiers?: Array<{
        identifier_type: string;
        identifier_value: string;
        is_primary: boolean;
    }>;
    contacts?: Array<{
        contact_type: string;
        contact_value: string;
        is_primary: boolean;
    }>;
    addresses?: Array<{
        address_type: string;
        address_line1: string;
        address_line2?: string;
        city: string;
        postal_code?: string;
        is_primary: boolean;
    }>;
    emergency_contacts?: Array<{
        name: string;
        relationship: string;
        phone: string;
        address?: string;
    }>;
};

export type PatientSearchResult = {
    id: number;
    hospital_number: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
};

export type PatientMergeConflict = {
    field: string;
    sourceValue: string;
    targetValue: string;
};

export type PatientMergeData = {
    keep_source: boolean;
    field_selections: Record<string, 'source' | 'target'>;
};

export type TimelineEventType = 'visit' | 'consultation' | 'prescription' | 'lab_result' | 'vaccination' | 'allergy' | 'condition' | 'procedure' | 'document' | 'alert';

export type TimelineEvent = {
    id: number;
    type: TimelineEventType;
    date: string;
    title: string;
    description?: string;
    details?: Record<string, any>;
    provider?: string;
    location?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
};

export type DuplicateWarningProps = {
    isOpen: boolean;
    onClose: () => void;
    duplicates: Patient[];
    onContinueAnyway: () => void;
    onSelectDuplicate: (patientId: number) => void;
};

export type ClinicalTimelineProps = {
    events: TimelineEvent[];
    title?: string;
    compact?: boolean;
    maxEvents?: number;
};
