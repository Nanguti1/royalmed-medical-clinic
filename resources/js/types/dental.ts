export type DentalTooth = {
    id: number;
    patient_id: number;
    tooth_number: number;
    tooth_name: string;
    condition: string | null;
    notes: string | null;
    last_examined: string | null;
    needs_treatment: boolean;
    is_extracted: boolean;
    is_implanted: boolean;
    is_crowned: boolean;
    is_filled: boolean;
    root_canal: boolean;
    mobility: string | null;
    probing_depth: number | null;
    attachment_level: number | null;
    created_at: string;
    updated_at: string;
};

export type DentalChart = {
    id: number;
    patient_id: number;
    chart_date: string;
    notes: string | null;
    created_by: number | null;
    teeth?: DentalTooth[];
    created_at: string;
    updated_at: string;
};

export type DentalProcedure = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    category: string;
    base_cost: number;
    duration_minutes: number | null;
    anesthesia_required: boolean;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type DentalTreatmentPlan = {
    id: number;
    patient_id: number;
    plan_date: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimated_cost: number;
    actual_cost: number | null;
    notes: string | null;
    created_by: number | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    procedures?: DentalTreatmentPlanProcedure[];
    attachments?: DentalAttachment[];
    notes?: DentalNote[];
    created_at: string;
    updated_at: string;
};

export type DentalTreatmentPlanProcedure = {
    id: number;
    treatment_plan_id: number;
    procedure_id: number;
    tooth_number: number | null;
    quadrant: string | null;
    estimated_cost: number;
    actual_cost: number | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    notes: string | null;
    procedure?: DentalProcedure;
    created_at: string;
    updated_at: string;
};

export type DentalAttachment = {
    id: number;
    patient_id: number;
    treatment_plan_id: number | null;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    description: string | null;
    attachment_type: string;
    uploaded_by: number | null;
    created_at: string;
};

export type DentalNote = {
    id: number;
    patient_id: number;
    treatment_plan_id: number | null;
    note: string;
    note_type: string;
    created_by: number | null;
    created_at: string;
};

export type DentalAppointment = {
    id: number;
    patient_id: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
    appointment_type: string;
    status: string;
    dental_chair_id: number | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    dentalChair?: {
        id: number;
        chair_name: string;
    };
};
