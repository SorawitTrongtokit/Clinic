export interface Address {
    houseNo: string;
    moo?: string;
    tambon: string;
    amphoe: string;
    province: string;
    zip?: string;
    full_address?: string; // Optional for legacy compatibility or display
}

export interface Patient {
    id: string;
    hn: string;
    id_card: string;
    prefix: string;
    first_name: string;
    last_name: string;
    birthdate: string;
    phone: string;
    address: Address | string; // Supporting legacy string for now, but preferring Address object
    underlying_disease?: string;
    drug_allergy?: string;
    treatment_right: string;
    gender?: 'male' | 'female';
    created_at?: string;
}

export interface Visit {
    id: string;
    patient_id: string;
    visit_date: string;
    // Vitals
    temp?: number;
    pulse?: number;
    resp_rate?: number;
    bp_sys?: number;
    bp_dia?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    // Screening
    urgency?: string;
    alcohol?: boolean;
    smoking?: boolean;
    // Diagnosis
    cc?: string;
    pe?: string;
    diagnosis?: string;
    icd10_code?: string;
    // Meta
    examiner?: string;
    total_cost?: number;
}
