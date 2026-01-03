export interface Address {
    houseNo: string;
    moo?: string;
    tambon: string;
    amphoe: string;
    province: string;
    zip?: string;
    full_address?: string;
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
    address: Address | string;
    underlying_disease?: string;
    drug_allergy?: string;
    treatment_right: string;
    gender?: 'male' | 'female';
    notes?: string;
    created_at?: string;
}

export interface Medicine {
    id: string;
    name: string;
    price_per_unit: number;
    unit: string;
    stock_qty: number;
    instruction?: string;
    created_at?: string;
}

export interface ICD10Code {
    code: string;
    description_th?: string;
    description_en?: string;
}

export interface PrescriptionItem {
    medicine_id: string;
    name: string;
    qty: number;
    price: number;
    unit: string;
}

export interface Prescription {
    id: string;
    visit_id: string;
    medicine_id: string;
    qty: number;
    price: number;
    total_price?: number;
    medicines?: Medicine;
    created_at?: string;
}

export interface Visit {
    id: string;
    patient_id: string;
    visit_date?: string;
    temp?: number;
    pulse?: number;
    resp_rate?: number;
    bp_sys?: number;
    bp_dia?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    urgency?: string;
    alcohol?: boolean;
    smoking?: boolean;
    cc?: string;
    pe?: string;
    diagnosis?: string;
    icd10_code?: string;
    examiner?: string;
    total_cost?: number;
    created_at?: string;
}

export interface VisitWithPatient extends Visit {
    patients?: Patient;
    prescriptions?: Prescription[];
}

export interface VitalsData {
    temp: string;
    pulse: string;
    resp_rate: string;
    bp_sys: string;
    bp_dia: string;
    weight: string;
    height: string;
    bmi: string;
    urgency: string;
    alcohol: boolean;
    smoking: boolean;
}

export interface DiagnosisData {
    cc: string;
    pe: string;
    diagnosis: string;
    icd10_code: string;
}

export interface VisitFormData extends VitalsData, DiagnosisData {
    patient_id: string;
    patient: Patient | null;
    basket: PrescriptionItem[];
    total_cost: number;
    examiner: string;
}

export interface VisitSummaryData {
    patients?: Patient;
    patient?: Patient;
    basket?: PrescriptionItem[];
    total_cost?: number;
    examiner?: string;
    weight?: string | number;
    height?: string | number;
    bp_sys?: string | number;
    bp_dia?: string | number;
    temp?: string | number;
    pulse?: string | number;
    resp_rate?: string | number;
    cc?: string;
    pe?: string;
    urgency?: string;
    alcohol?: boolean;
    smoking?: boolean;
    diagnosis?: string;
}
