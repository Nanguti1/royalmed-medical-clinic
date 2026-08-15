export type PatientPortalUser = {
    id: number;
    first_name: string;
    last_name: string;
    other_names: string | null;
    email: string;
    phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
    blood_type: string | null;
    allergies: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
};

export type PortalAppointment = {
    id: number;
    patient_id: number;
    doctor_id: number | null;
    appointment_date: string;
    appointment_time: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    reason: string | null;
    notes: string | null;
    doctor?: {
        id: number;
        first_name: string;
        last_name: string;
        specialization: string | null;
    };
    created_at: string;
    updated_at: string;
};

export type PortalLabResult = {
    id: number;
    patient_id: number;
    test_name: string;
    test_type: string | null;
    result: string | null;
    reference_range: string | null;
    is_abnormal: boolean;
    is_critical: boolean;
    test_date: string;
    ordered_by: string | null;
    verified_by: string | null;
    verified_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type PortalInvoice = {
    id: number;
    patient_id: number;
    invoice_number: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
    issued_date: string;
    due_date: string | null;
    paid_date: string | null;
    items: InvoiceItem[];
    created_at: string;
    updated_at: string;
};

export type InvoiceItem = {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
};

export type PortalPayment = {
    id: number;
    invoice_id: number;
    amount: number;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'insurance';
    payment_date: string;
    transaction_id: string | null;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type PortalDocument = {
    id: number;
    patient_id: number;
    document_type: string;
    file_name: string;
    file_path: string;
    file_size: number;
    upload_date: string;
    description: string | null;
    created_at: string;
    updated_at: string;
};

export type PortalMessage = {
    id: number;
    patient_id: number;
    sender_id: number | null;
    sender_type: 'patient' | 'doctor' | 'admin' | null;
    subject: string;
    message: string;
    is_read: boolean;
    sent_at: string;
    read_at: string | null;
    sender?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    created_at: string;
    updated_at: string;
};

export type PortalNotification = {
    id: number;
    patient_id: number;
    type: 'appointment' | 'lab_result' | 'payment' | 'message' | 'general';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
};

export type PortalStats = {
    upcoming_appointments: number;
    pending_invoices: number;
    unread_messages: number;
    pending_lab_results: number;
    total_visits: number;
    last_visit_date: string | null;
};

export type AppointmentFormData = {
    doctor_id: number;
    appointment_date: string;
    appointment_time: string;
    reason: string;
    notes?: string;
};

export type ProfileFormData = {
    first_name: string;
    last_name: string;
    other_names?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    allergies?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
};

export type PaymentFormData = {
    invoice_id: number;
    amount: number;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'insurance';
    transaction_id?: string;
    notes?: string;
};

export type MessageFormData = {
    subject: string;
    message: string;
};

// Staff Portal Types
export type StaffUser = {
    id: number;
    first_name: string;
    last_name: string;
    other_names: string | null;
    email: string;
    phone: string | null;
    role: string;
    specialization: string | null;
    department: string | null;
    employee_id: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
};

export type StaffSchedule = {
    id: number;
    staff_id: number;
    date: string;
    start_time: string;
    end_time: string;
    location: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type StaffTask = {
    id: number;
    staff_id: number;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
};

export type StaffAnnouncement = {
    id: number;
    title: string;
    content: string;
    category: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    published_at: string;
    published_by: number | null;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type StaffMessage = {
    id: number;
    sender_id: number | null;
    recipient_id: number | null;
    subject: string;
    message: string;
    is_read: boolean;
    sent_at: string;
    read_at: string | null;
    sender?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    recipient?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    created_at: string;
    updated_at: string;
};

export type LeaveRequest = {
    id: number;
    staff_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approved_by: number | null;
    approved_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
};

export type AttendanceRecord = {
    id: number;
    staff_id: number;
    date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    status: 'present' | 'absent' | 'late' | 'early_leave' | 'half_day';
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type StaffStats = {
    upcoming_shifts: number;
    pending_tasks: number;
    unread_messages: number;
    pending_leave_requests: number;
    attendance_rate: number;
    tasks_completed_this_month: number;
};

export type TaskFormData = {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
};

export type LeaveRequestFormData = {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason?: string;
};

export type AnnouncementFormData = {
    title: string;
    content: string;
    category?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    expires_at?: string;
};