export type Refund = {
    id: number;
    invoice_id: number;
    refund_number: string;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'processed';
    refund_method: string;
    refund_date: string | null;
    processed_by: number | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    invoice?: {
        id: number;
        invoice_number: string;
        total_amount: number;
    };
    processor?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type CreditNote = {
    id: number;
    invoice_id: number;
    credit_note_number: string;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'applied' | 'cancelled';
    expiry_date: string | null;
    applied_date: string | null;
    approved_by: number | null;
    approved_at: string | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    invoice?: {
        id: number;
        invoice_number: string;
        total_amount: number;
    };
    approver?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type Deposit = {
    id: number;
    patient_id: number;
    deposit_number: string;
    amount: number;
    deposit_date: string;
    method: 'cash' | 'card' | 'bank_transfer' | 'check';
    reference_number: string | null;
    status: 'pending' | 'confirmed' | 'applied' | 'refunded';
    applied_invoice_id: number | null;
    notes: string | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    invoice?: {
        id: number;
        invoice_number: string;
    };
    created_at: string;
    updated_at: string;
};

export type PaymentPlan = {
    id: number;
    patient_id: number;
    invoice_id: number;
    plan_number: string;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    installment_count: number;
    installment_amount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
    start_date: string;
    end_date: string;
    status: 'active' | 'completed' | 'cancelled' | 'defaulted';
    next_payment_date: string | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        hospital_number: string;
    };
    invoice?: {
        id: number;
        invoice_number: string;
    };
    installments?: PaymentPlanInstallment[];
    created_at: string;
    updated_at: string;
};

export type PaymentPlanInstallment = {
    id: number;
    payment_plan_id: number;
    installment_number: number;
    amount: number;
    due_date: string;
    paid_date: string | null;
    status: 'pending' | 'paid' | 'overdue' | 'skipped';
};

export type Discount = {
    id: number;
    name: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    start_date: string;
    end_date: string | null;
    min_purchase_amount: number | null;
    max_discount_amount: number | null;
    applicable_services: string[];
    status: 'active' | 'inactive' | 'expired';
    usage_limit: number | null;
    usage_count: number;
    created_at: string;
    updated_at: string;
};

export type SplitPayment = {
    invoice_id: number;
    total_amount: number;
    payments: {
        method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'insurance';
        amount: number;
        reference: string | null;
    }[];
};

export type CardPayment = {
    invoice_id: number;
    card_number: string;
    cardholder_name: string;
    expiry_month: string;
    expiry_year: string;
    cvv: string;
    amount: number;
    currency: string;
};
