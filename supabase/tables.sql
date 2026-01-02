-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hn TEXT NOT NULL UNIQUE, -- Generated HN (e.g., 690001)
    id_card TEXT NOT NULL UNIQUE,
    prefix TEXT NOT NULL, -- นาย, นาง, นางสาว, เด็กชาย, เด็กหญิง
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birthdate DATE NOT NULL,
    address JSONB, -- { houseNo, moo, tambon, amphoe, province, zip }
    phone TEXT,
    underlying_disease TEXT DEFAULT '',
    drug_allergy TEXT DEFAULT '',
    treatment_right TEXT NOT NULL, -- บัตรทอง, เบิกได้, ประกันสังคม, ชำระเงินเอง
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Medicines Table (Stock)
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL, -- เม็ด, ขวด, แผง
    stock_qty INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ICD10 Codes Table
CREATE TABLE IF NOT EXISTS icd10_codes (
    code TEXT PRIMARY KEY,
    description_th TEXT,
    description_en TEXT
);

-- 4. Visits Table (OPD Records)
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Vitals
    temp DECIMAL(4, 1),
    pulse INTEGER,
    resp_rate INTEGER,
    bp_sys INTEGER,
    bp_dia INTEGER,
    weight DECIMAL(5, 2),
    height DECIMAL(5, 1),
    bmi DECIMAL(5, 2),
    
    -- Screening
    urgency TEXT, -- ฉุกเฉิน, ไม่ฉุกเฉิน
    alcohol BOOLEAN DEFAULT FALSE,
    smoking BOOLEAN DEFAULT FALSE,
    
    -- Diagnosis
    cc TEXT, -- Chief Complaint
    pe TEXT, -- Physical Exam
    diagnosis TEXT, -- Free text or primary diagnosis name
    icd10_code TEXT REFERENCES icd10_codes(code),
    
    examiner TEXT DEFAULT 'น.ส.ภัทรภร พวงอุบล',
    total_cost DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Prescriptions Table (Visit Items)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    qty INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL, -- Snapshot price at time of prescription
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (qty * price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_hn ON patients(hn);
CREATE INDEX IF NOT EXISTS idx_patients_id_card ON patients(id_card);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
