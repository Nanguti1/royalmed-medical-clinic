export type PatientStatistics = {
    total_patients: number;
    new_patients: number;
    returning_patients: number;
    by_gender: {
        male: number;
        female: number;
        other: number;
    };
    by_age_group: {
        '0-18': number;
        '19-35': number;
        '36-50': number;
        '51-65': number;
        '65+': number;
    };
};

export type FinancialReport = {
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    by_payment_method: {
        cash: number;
        insurance: number;
        credit: number;
    };
    by_service_type: {
        consultations: number;
        lab_tests: number;
        pharmacy: number;
        procedures: number;
    };
};

export type LaboratoryReport = {
    total_tests: number;
    completed_tests: number;
    pending_tests: number;
    by_test_type: Record<string, number>;
    average_turnaround_time: number;
};

export type InventoryReport = {
    total_items: number;
    low_stock_items: number;
    out_of_stock_items: number;
    expiring_soon: number;
    by_category: Record<string, number>;
    total_value: number;
};

export type RevenueReport = {
    date: string;
    total_revenue: number;
    consultations: number;
    lab_tests: number;
    pharmacy: number;
    procedures: number;
};

export type RevenueTrends = {
    date: string;
    revenue: number;
}[];

export type DiseaseStatistics = {
    total_cases: number;
    by_disease: Record<string, number>;
    by_severity: {
        mild: number;
        moderate: number;
        severe: number;
        critical: number;
    };
    by_age_group: Record<string, number>;
};

export type ConsultationStatistics = {
    total_consultations: number;
    by_type: Record<string, number>;
    average_duration: number;
    by_time_of_day: {
        morning: number;
        afternoon: number;
        evening: number;
    };
};

export type DrugConsumption = {
    drug_name: string;
    quantity_used: number;
    cost: number;
    by_prescription: number;
    by_dispense: number;
}[];

export type InventoryTurnover = {
    item_name: string;
    turnover_rate: number;
    days_on_hand: number;
    category: string;
}[];

export type DoctorPerformance = {
    doctor_id: number;
    doctor_name: string;
    total_consultations: number;
    total_revenue: number;
    average_consultation_time: number;
    patient_satisfaction_score: number;
    by_service_type: Record<string, number>;
};

export type DoctorProductivity = {
    date: string;
    consultations: number;
    procedures: number;
    revenue: number;
}[];

export type ClaimSuccessRate = {
    total_claims: number;
    approved_claims: number;
    rejected_claims: number;
    pending_claims: number;
    success_rate: number;
    average_processing_time: number;
    by_insurer: Record<string, {
        total: number;
        approved: number;
        success_rate: number;
    }>;
};

export type DentalReport = {
    total_procedures: number;
    by_procedure_type: Record<string, number>;
    total_revenue: number;
    patient_count: number;
};

export type PatientGrowth = {
    date: string;
    new_patients: number;
    total_patients: number;
}[];

export type WaitingTimeStatistics = {
    average_waiting_time: number;
    median_waiting_time: number;
    max_waiting_time: number;
    by_department: Record<string, number>;
    by_time_of_day: {
        morning: number;
        afternoon: number;
        evening: number;
    };
};

export type DentalReport = {
    total_procedures: number;
    by_procedure_type: Record<string, number>;
    total_revenue: number;
    patient_count: number;
};
