export type Insurer = {
    id: number;
    name: string;
    code: string;
    type: 'private' | 'public' | 'nhif' | 'corporate';
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    website: string | null;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type InsuranceScheme = {
    id: number;
    insurer_id: number;
    name: string;
    code: string;
    description: string | null;
    coverage_type: string;
    coverage_limits: string | null;
    copayment_percentage: number | null;
    annual_limit: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    insurer?: Insurer;
};

export type PatientCoverage = {
    id: number;
    patient_id: number;
    insurer_id: number;
    insurance_scheme_id: number;
    policy_number: string;
    policy_type: 'individual' | 'family' | 'corporate';
    effective_date: string;
    expiry_date: string;
    status: 'active' | 'expired' | 'cancelled' | 'pending';
    is_primary: boolean;
    principal_member_id: number | null;
    relationship_to_principal: string | null;
    created_by: number | null;
    insurer?: Insurer;
    scheme?: InsuranceScheme;
    created_at: string;
    updated_at: string;
};

export type InsuranceClaim = {
    id: number;
    patient_id: number;
    insurer_id: number;
    invoice_id: number;
    claim_number: string;
    service_date: string;
    submission_date: string | null;
    approval_date: string | null;
    payment_date: string | null;
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'partially_approved' | 'in_review' | 'processing';
    amount_claimed: number;
    amount_approved: number | null;
    amount_paid: number | null;
    rejection_reason: string | null;
    notes: string | null;
    created_by: number | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    insurer?: Insurer;
    invoice?: {
        id: number;
        invoice_number: string;
        total_amount: number;
    };
    items?: InsuranceClaimItem[];
    created_at: string;
    updated_at: string;
};

export type InsuranceClaimItem = {
    id: number;
    claim_id: number;
    invoice_item_id: number;
    service_code: string;
    service_description: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    amount_approved: number | null;
    notes: string | null;
};

export type Preauthorization = {
    id: number;
    patient_id: number;
    insurer_id: number;
    insurance_scheme_id: number;
    request_date: string;
    authorization_number: string | null;
    requested_services: string;
    diagnosis: string;
    authorized_amount: number | null;
    used_amount: number | null;
    status: 'pending' | 'approved' | 'rejected' | 'expired' | 'used';
    approval_date: string | null;
    expiry_date: string | null;
    rejection_reason: string | null;
    notes: string | null;
    created_by: number | null;
    updated_by: number | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    insurer?: Insurer;
    scheme?: InsuranceScheme;
    created_at: string;
    updated_at: string;
};

export type ClaimAgingReport = {
    claims_0_30: number;
    claims_31_60: number;
    claims_61_90: number;
    claims_90_plus: number;
    total_value_0_30: number;
    total_value_31_60: number;
    total_value_61_90: number;
    total_value_90_plus: number;
    by_insurer: Array<{
        insurer_id: number;
        insurer_name: string;
        claims_0_30: number;
        claims_31_60: number;
        claims_61_90: number;
        claims_90_plus: number;
    }>;
};
