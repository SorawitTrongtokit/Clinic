-- 1. HN Auto-generation (Server-Side Sequence)
-- Create a table to track the running number for each year to ensure atomicity
CREATE TABLE IF NOT EXISTS public.running_numbers (
    type text PRIMARY KEY,
    year text NOT NULL,
    last_number int DEFAULT 0
);

-- Enable RLS for security (though mostly used by system)
ALTER TABLE public.running_numbers ENABLE ROW LEVEL SECURITY;

-- Drop exist policies to avoid "already exists" error on re-run
DROP POLICY IF EXISTS "Allow read for auth" ON public.running_numbers;
DROP POLICY IF EXISTS "Allow write for auth" ON public.running_numbers;

CREATE POLICY "Allow read for auth" ON public.running_numbers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for auth" ON public.running_numbers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Function to generate HN automatically on INSERT
CREATE OR REPLACE FUNCTION generate_hn() RETURNS TRIGGER AS $$
DECLARE
    current_year text;
    new_number int;
BEGIN
    -- Get current Thai Year (2 digits), e.g., 2024 -> 2567 -> 67
    current_year := substring((EXTRACT(YEAR FROM now()) + 543)::text, 3, 2);
    
    -- Atomic Upsert (Insert or Update) to get the new running number
    INSERT INTO public.running_numbers (type, year, last_number)
    VALUES ('hn', current_year, 1)
    ON CONFLICT (type) DO UPDATE
    SET last_number = CASE 
        WHEN running_numbers.year = EXCLUDED.year THEN running_numbers.last_number + 1
        ELSE 1 -- Reset count if we crossed into a new year
    END,
    year = EXCLUDED.year
    RETURNING last_number INTO new_number;

    -- Format HN as YY-NNNNN (e.g., 67-00001)
    NEW.hn := current_year || '-' || lpad(new_number::text, 5, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Before Insert on Patients
DROP TRIGGER IF EXISTS set_hn_trigger ON public.patients;
CREATE TRIGGER set_hn_trigger
BEFORE INSERT ON public.patients
FOR EACH ROW
WHEN (NEW.hn IS NULL OR NEW.hn = '')
EXECUTE FUNCTION generate_hn();


-- 2. Visit Transaction RPC (All-or-Nothing Save)
CREATE OR REPLACE FUNCTION save_visit_transaction(
    p_patient_id uuid,
    p_examiner text,
    p_visit_data jsonb,
    p_prescriptions jsonb
) RETURNS jsonb AS $$
DECLARE
    v_visit_id uuid;
    p_item jsonb;
BEGIN
    -- Start Transaction is implicit in functions
    
    -- A. Insert Visit Record (Removed 'date' column as it doesn't exist, created_at is automatic)
    INSERT INTO visits (
        patient_id, examiner, 
        temp, pulse, resp_rate, bp_sys, bp_dia, weight, height, bmi,
        urgency, alcohol, smoking, cc, pe, diagnosis, icd10_code, total_cost
    ) VALUES (
        p_patient_id, p_examiner,
        (p_visit_data->>'temp')::numeric, 
        (p_visit_data->>'pulse')::int, 
        (p_visit_data->>'resp_rate')::int,
        (p_visit_data->>'bp_sys')::int,
        (p_visit_data->>'bp_dia')::int,
        (p_visit_data->>'weight')::numeric,
        (p_visit_data->>'height')::numeric,
        (p_visit_data->>'bmi')::numeric,
        p_visit_data->>'urgency',
        (p_visit_data->>'alcohol')::boolean,
        (p_visit_data->>'smoking')::boolean,
        p_visit_data->>'cc',
        p_visit_data->>'pe',
        p_visit_data->>'diagnosis',
        p_visit_data->>'icd10_code',
        (p_visit_data->>'total_cost')::numeric
    ) RETURNING id INTO v_visit_id;

    -- B. Process Prescriptions & Update Stock (N+1 Fix)
    IF p_prescriptions IS NOT NULL AND jsonb_array_length(p_prescriptions) > 0 THEN
        FOR p_item IN SELECT * FROM jsonb_array_elements(p_prescriptions) LOOP
            -- 1. Insert Prescription
            INSERT INTO prescriptions (visit_id, medicine_id, qty, price)
            VALUES (
                v_visit_id, 
                (p_item->>'medicine_id')::uuid, 
                (p_item->>'qty')::int, 
                (p_item->>'price')::numeric
            );

            -- 2. Update Stock (Decrement)
            UPDATE medicines 
            SET stock_qty = stock_qty - (p_item->>'qty')::int
            WHERE id = (p_item->>'medicine_id')::uuid;
        END LOOP;
    END IF;

    -- If we get here, everything succeeded
    RETURN json_build_object('success', true, 'visit_id', v_visit_id);

EXCEPTION WHEN OTHERS THEN
    -- If any error occurs, the entire transaction rolls back automatically
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
