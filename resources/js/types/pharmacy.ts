export type ControlledDrugRegister = {
    id: number;
    drug_name: string;
    generic_name: string;
    schedule: string;
    batch_number: string;
    quantity: number;
    balance: number;
    received_date: string;
    expiry_date: string;
    supplier: string;
    issued_to: string | null;
    issued_date: string | null;
    issued_by: number | null;
    purpose: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type StockAdjustment = {
    id: number;
    medicine_id: number;
    adjustment_type: 'addition' | 'subtraction' | 'damage' | 'expiry' | 'theft' | 'correction';
    quantity: number;
    reason: string;
    reference_number: string | null;
    approved_by: number | null;
    approved_at: string | null;
    status: 'pending' | 'approved' | 'rejected';
    performed_by: number | null;
    performed_at: string | null;
    medicine?: {
        id: number;
        name: string;
        generic_name: string;
    };
    approver?: {
        id: number;
        name: string;
    };
    performer?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type StockTransfer = {
    id: number;
    medicine_id: number;
    from_location: string;
    to_location: string;
    quantity: number;
    transfer_date: string;
    reference_number: string;
    notes: string | null;
    requested_by: number | null;
    approved_by: number | null;
    received_by: number | null;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    medicine?: {
        id: number;
        name: string;
        generic_name: string;
    };
    requester?: {
        id: number;
        name: string;
    };
    approver?: {
        id: number;
        name: string;
    };
    receiver?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type PurchaseOrder = {
    id: number;
    supplier_id: number;
    order_number: string;
    order_date: string;
    expected_delivery_date: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'partial' | 'completed' | 'cancelled';
    total_amount: number;
    notes: string | null;
    created_by: number | null;
    approved_by: number | null;
    approved_at: string | null;
    supplier?: {
        id: number;
        name: string;
        contact_person: string;
        phone: string;
    };
    items?: PurchaseOrderItem[];
    creator?: {
        id: number;
        name: string;
    };
    approver?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type PurchaseOrderItem = {
    id: number;
    purchase_order_id: number;
    medicine_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    received_quantity: number;
    medicine?: {
        id: number;
        name: string;
        generic_name: string;
    };
};

export type GoodsReceivedNote = {
    id: number;
    purchase_order_id: number;
    grn_number: string;
    received_date: string;
    received_by: number;
    supplier_id: number;
    notes: string | null;
    status: 'draft' | 'completed' | 'verified';
    total_quantity: number;
    total_value: number;
    supplier?: {
        id: number;
        name: string;
    };
    receiver?: {
        id: number;
        name: string;
    };
    items?: GRNItem[];
    created_at: string;
    updated_at: string;
};

export type GRNItem = {
    id: number;
    grn_id: number;
    medicine_id: number;
    batch_number: string;
    quantity: number;
    expiry_date: string;
    unit_price: number;
    total_price: number;
    medicine?: {
        id: number;
        name: string;
        generic_name: string;
    };
};

export type ReorderItem = {
    medicine_id: number;
    medicine_name: string;
    generic_name: string;
    current_stock: number;
    reorder_level: number;
    reorder_quantity: number;
    last_purchase_date: string | null;
    average_monthly_usage: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    supplier?: {
        id: number;
        name: string;
        lead_time_days: number;
    };
};

export type DrugInteraction = {
    drug1: string;
    drug2: string;
    severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
    description: string;
    recommendation: string;
};
