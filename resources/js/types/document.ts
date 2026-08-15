export type Document = {
    id: number;
    patient_id: number | null;
    visit_id: number | null;
    consultation_id: number | null;
    title: string;
    description: string | null;
    category: 'general' | 'medical' | 'lab' | 'radiology' | 'consent' | 'insurance' | 'legal';
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    mime_type: string;
    is_sensitive: boolean;
    is_confidential: boolean;
    expires_at: string | null;
    uploaded_by: number | null;
    uploaded_at: string;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    uploadedBy?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type DocumentVersion = {
    id: number;
    document_id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    mime_type: string;
    version_notes: string | null;
    uploaded_by: number | null;
    uploadedBy?: {
        id: number;
        name: string;
    };
    created_at: string;
};

export type ConsentTemplate = {
    id: number;
    name: string;
    description: string | null;
    content: string;
    category: string;
    requires_witness: boolean;
    requires_signature: boolean;
    expiry_days: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type PatientConsent = {
    id: number;
    patient_id: number;
    consent_template_id: number;
    signature_data: string | null;
    signature_method: 'digital' | 'written' | 'verbal';
    witness_name: string | null;
    witness_title: string | null;
    status: 'pending' | 'signed' | 'expired' | 'revoked';
    signed_at: string | null;
    expires_at: string | null;
    signed_by: number | null;
    template?: ConsentTemplate;
    signedBy?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};
