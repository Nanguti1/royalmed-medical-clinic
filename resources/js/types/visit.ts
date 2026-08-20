export type Visit = {
    id: number;
    patient_id: number;
    visit_date: string | null;
    visit_status_id: number | null;
    notes: string | null;
    receptionist_id: number | null;
    visit_number: number | null;
    started_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        other_names: string | null;
        phone: string | null;
        email: string | null;
    };
    vitalSign?: VitalSign;
    queueEntry?: QueueEntry;
    consultation?: Consultation;
    prescriptions?: Prescription[];
    labOrders?: any[];
    invoice?: any;
    status?: {
        id: number;
        code: string;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type VitalSign = {
    id: number;
    visit_id: number;
    temperature_c: number | null;
    blood_pressure: string | null;
    pulse: number | null;
    respiratory_rate: number | null;
    weight_kg: number | null;
    height_cm: number | null;
    created_at: string;
    updated_at: string;
};

export type QueueEntry = {
    id: number;
    visit_id: number;
    position: number | null;
    status: 'waiting' | 'called' | 'in_progress' | 'completed';
    called_at: string | null;
    served_at: string | null;
    metadata?: {
        action?: string;
        consultation_id?: number;
        lab_order_id?: number;
    };
    visit?: {
        id: number;
        patient?: {
            id: number;
            first_name: string;
            last_name: string;
            other_names: string | null;
        };
    };
    created_at: string;
    updated_at: string;
};

export type Consultation = {
    id: number;
    visit_id: number;
    provider_id: number | null;
    chief_complaint: string | null;
    history: string | null;
    examination: string | null;
    plan: string | null;
    notes: string | null;
    visit?: {
        id: number;
        patient?: {
            id: number;
            first_name: string;
            last_name: string;
            other_names: string | null;
            phone: string | null;
            email: string | null;
        };
        vitalSign?: VitalSign;
        queueEntry?: QueueEntry;
        status?: {
            id: number;
            code: string;
            name: string;
        };
    };
    diagnoses?: Diagnosis[];
    prescriptions?: Prescription[];
    created_at: string;
    updated_at: string;
};

export type Diagnosis = {
    id: number;
    consultation_id: number;
    code: string | null;
    description: string | null;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
};

export type Prescription = {
    id: number;
    visit_id: number;
    prescribed_by: number | null;
    notes: string | null;
    prescription_number: string | null;
    finalized_at: string | null;
    dispensed_at: string | null;
    visit?: {
        id: number;
        patient?: {
            id: number;
            first_name: string;
            last_name: string;
            other_names: string | null;
        };
    };
    items?: PrescriptionItem[];
    created_at: string;
    updated_at: string;
};

export type PrescriptionItem = {
    id: number;
    prescription_id: number;
    medicine_id: number;
    dosage_unit_id: number | null;
    frequency_id: number | null;
    route_id: number | null;
    duration_unit_id: number | null;
    duration_quantity: number | null;
    quantity: number;
    instructions: string | null;
    dispensed_quantity: number | null;
    dispensed_at: string | null;
    medicine?: {
        id: number;
        name: string;
        generic_name: string | null;
    };
    dosageUnit?: {
        id: number;
        name: string;
        abbreviation: string | null;
    };
    frequency?: {
        id: number;
        name: string;
        times_per_day: number | null;
        description: string | null;
    };
    route?: {
        id: number;
        name: string;
        description: string | null;
    };
    durationUnit?: {
        id: number;
        name: string;
        abbreviation: string | null;
    };
    created_at: string;
    updated_at: string;
};

export type Medicine = {
    id: number;
    name: string;
    generic_name: string | null;
    medicine_category_id: number | null;
    medicine_form_id: number | null;
    strength_id: number | null;
    unit_price: number | null;
    reorder_level: number | null;
    total_stock?: number;
    is_low_stock?: boolean;
    has_expired?: boolean;
    expiring_soon?: boolean;
    batches?: InventoryBatch[];
    available_stock?: number;
};

export type DosageUnit = {
    id: number;
    name: string;
    abbreviation: string | null;
};

export type Frequency = {
    id: number;
    name: string;
    times_per_day: number | null;
    description: string | null;
};

export type Route = {
    id: number;
    name: string;
    description: string | null;
};

export type DurationUnit = {
    id: number;
    name: string;
    abbreviation: string | null;
};

export type InventoryBatch = {
    id: number;
    medicine_id: number;
    batch_number: string;
    expiry_date: string | null;
    quantity: number;
    purchase_price: number | null;
    supplier_id: number | null;
    received_at: string | null;
    medicine?: Medicine;
    is_expired?: boolean;
    has_stock?: boolean;
    is_depleted?: boolean;
    created_at: string;
    updated_at: string;
};

export type StockMovement = {
    id: number;
    medicine_id: number;
    inventory_batch_id: number | null;
    quantity: number;
    movement_type: 'in' | 'out';
    reference_type: string | null;
    reference_id: number | null;
    user_id: number | null;
    batch?: InventoryBatch;
    medicine?: Medicine;
    created_at: string;
    updated_at: string;
};

export type VisitFormData = {
    patient_id: number;
    visit_date?: string;
    receptionist_id?: number;
    notes?: string;
};

export type VitalsFormData = {
    visit_id: number;
    temperature_c?: number;
    blood_pressure?: string;
    pulse?: number;
    respiratory_rate?: number;
    weight_kg?: number;
    height_cm?: number;
};

export type QueueFormData = {
    visit_id: number;
    position?: number;
};

export type ConsultationFormData = {
    visit_id: number;
    provider_id?: number;
    chief_complaint?: string;
    history?: string;
    examination?: string;
    plan?: string;
    notes?: string;
};

export type ConsultationTemplate = {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    chief_complaint_template: string | null;
    history_template: string | null;
    examination_template: string | null;
    plan_template: string | null;
    notes_template: string | null;
    is_active: boolean;
    created_by: number | null;
    created_at: string;
    updated_at: string;
};

export type ConsultationTemplateFormData = {
    name: string;
    description?: string;
    category?: string;
    chief_complaint_template?: string;
    history_template?: string;
    examination_template?: string;
    plan_template?: string;
    notes_template?: string;
    is_active?: boolean;
};

export type ConsultationAttachment = {
    id: number;
    consultation_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    description: string | null;
    uploaded_by: number | null;
    created_at: string;
    updated_at: string;
};

export type ConsultationAttachmentFormData = {
    consultation_id: number;
    file: File;
    description?: string;
};

export type SOAPNote = {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
};

export type ConsultationSOAPFormData = {
    visit_id: number;
    provider_id?: number;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    notes?: string;
};

export type PrescriptionFormData = {
    visit_id: number;
    prescribed_by?: number;
    notes?: string;
    items: PrescriptionItemFormData[];
};

export type PrescriptionItemFormData = {
    medicine_id: number;
    dosage_unit_id?: number;
    frequency_id?: number;
    route_id?: number;
    duration_unit_id?: number;
    duration_quantity?: number;
    quantity: number;
    instructions?: string;
};

export type ReceiveStockFormData = {
    medicine_id: number;
    batch_number: string;
    quantity: number;
    expiry_date: string;
    purchase_price?: number;
    supplier_id?: number;
    received_at?: string;
};

export type LabTest = {
    id: number;
    code: string | null;
    name: string;
    description: string | null;
    standard_units: string | null;
    price: number | null;
    lab_category_id: number | null;
    sample_type: string | null;
    sample_requirements: string | null;
    is_critical: boolean;
    turnaround_time_hours: number | null;
    category?: LabCategory;
    referenceRanges?: LabTestReferenceRange[];
    created_at: string;
    updated_at: string;
};

export type LabCategory = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
};

export type LabTestReferenceRange = {
    id: number;
    lab_test_id: number;
    age_group: string | null;
    sex: string | null;
    min_value: number | null;
    max_value: number | null;
    min_operator: string;
    max_operator: string;
    text_range: string | null;
    created_at: string;
    updated_at: string;
};

export type LabOrder = {
    id: number;
    visit_id: number;
    ordered_by: number | null;
    order_date: string;
    status: 'ordered' | 'in_progress' | 'completed';
    notes: string | null;
    in_progress_at: string | null;
    completed_at: string | null;
    priority: 'routine' | 'urgent' | 'stat';
    sample_collected_at: string | null;
    sample_collected_by: number | null;
    visit?: {
        id: number;
        patient?: {
            id: number;
            first_name: string;
            last_name: string;
            other_names: string | null;
        };
    };
    items?: LabOrderItem[];
    created_at: string;
    updated_at: string;
};

export type LabOrderItem = {
    id: number;
    lab_order_id: number;
    lab_test_id: number;
    status: string;
    sample_type: string | null;
    sample_collected_at: string | null;
    sample_collected_by: number | null;
    sample_status: 'pending' | 'collected' | 'received' | 'processing' | 'completed';
    test?: LabTest;
    result?: LabResult;
    created_at: string;
    updated_at: string;
};

export type LabResult = {
    id: number;
    lab_test_id: number;
    lab_order_item_id: number;
    result_value: string;
    units: string | null;
    reference_range: string | null;
    notes: string | null;
    recorded_by: number | null;
    recorded_at: string;
    is_abnormal: boolean;
    is_critical: boolean;
    verified_by: number | null;
    verified_at: string | null;
    verification_status: 'pending' | 'verified' | 'rejected';
    test?: LabTest;
    orderItem?: LabOrderItem;
    created_at: string;
    updated_at: string;
};

export type LabOrderFormData = {
    visit_id: number;
    ordered_by?: number;
    notes?: string;
    tests: {
        lab_test_id: number;
    }[];
};

export type LabResultFormData = {
    lab_test_id: number;
    lab_order_item_id: number;
    result_value: string;
    units?: string;
    reference_range?: string;
    notes?: string;
};

export type InvoiceStatus = {
    id: number;
    code: string;
    name: string;
};

export type InvoiceItem = {
    id: number;
    invoice_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    tax: number | null;
    created_at: string;
    updated_at: string;
};

export type Invoice = {
    id: number;
    visit_id: number;
    invoice_number: string;
    status_id: number | null;
    total_amount: number;
    due_amount: number;
    issued_at: string;
    visit?: {
        id: number;
        patient?: {
            id: number;
            first_name: string;
            last_name: string;
            other_names: string | null;
        };
    };
    items?: InvoiceItem[];
    status?: InvoiceStatus;
    payments?: any[];
    outstanding_balance?: number;
    created_at: string;
    updated_at: string;
};

export type InvoiceFormData = {
    visit_id: number;
    invoice_number?: string;
    items: {
        description: string;
        quantity: number;
        unit_price: number;
        total_price?: number;
        tax?: number;
    }[];
};
