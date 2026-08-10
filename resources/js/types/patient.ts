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

export type Patient = {
    id: number;
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
    gender?: Gender | null;
    county?: County | null;
    sub_county?: SubCounty | null;
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
};

export type PatientSearchResult = {
    id: number;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
};
