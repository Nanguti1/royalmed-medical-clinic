export type CriticalAlert = {
    id: number;
    lab_order_id: number;
    test_name: string;
    patient_id: number;
    result_value: string;
    reference_range: string;
    urgency: 'critical' | 'panic' | 'abnormal';
    alerted_at: string;
    acknowledged_by: number | null;
    acknowledged_at: string | null;
    notes: string | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    lab_order?: {
        id: number;
        order_number: string;
    };
    acknowledger?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type VerificationRequest = {
    id: number;
    lab_result_id: number;
    test_name: string;
    patient_id: number;
    result_value: string;
    reference_range: string;
    status: 'pending' | 'verified' | 'rejected';
    requested_by: number;
    requested_at: string;
    verified_by: number | null;
    verified_at: string | null;
    rejection_reason: string | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    requester?: {
        id: number;
        name: string;
    };
    verifier?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type Specimen = {
    id: number;
    specimen_number: string;
    patient_id: number;
    test_type: string;
    collection_date: string;
    collection_time: string;
    collected_by: number;
    received_date: string | null;
    received_by: number | null;
    processing_date: string | null;
    processed_by: number | null;
    result_date: string | null;
    status: 'collected' | 'received' | 'processing' | 'completed' | 'rejected' | 'cancelled';
    notes: string | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    collector?: {
        id: number;
        name: string;
    };
    receiver?: {
        id: number;
        name: string;
    };
    processor?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type WorklistItem = {
    id: number;
    lab_order_id: number;
    test_name: string;
    patient_id: number;
    priority: 'routine' | 'urgent' | 'stat';
    status: 'pending' | 'in_progress' | 'completed';
    assigned_to: number | null;
    estimated_completion: string | null;
    specimen_number: string | null;
    patient?: {
        id: number;
        first_name: string;
        last_name;
        hospital_number: string;
    };
    assignee?: {
        id: number;
        name: string;
    };
    lab_order?: {
        id: number;
        order_number: string;
    };
    created_at: string;
    updated_at: string;
};
