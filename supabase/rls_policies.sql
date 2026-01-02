-- Enable Row Level Security (RLS) on all tables
-- This ensures that no data can be accessed without a policy.

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd10_codes ENABLE ROW LEVEL SECURITY;

-- POLICY SET: AUTHENTICATED USERS (Ideally for Staff)
-- These policies allow anyone logged in via Supabase Auth (e.g., Google, Email) to do everything.
-- If you are not using Supabase Auth yet and just want it to work with the Public Key, see "ANONYMOUS" below.

CREATE POLICY "Enable all access for authenticated users" 
ON public.patients FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" 
ON public.visits FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" 
ON public.medicines FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" 
ON public.prescriptions FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ICD10 is usually read-only for staff, but maybe Admin wants to edit? 
-- Let's allow read for all authenticated, and write for all authenticated for simplicity for now.
CREATE POLICY "Enable all access for authenticated users" 
ON public.icd10_codes FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- ---------------------------------------------------------
-- OPTION: ALLOW ANONYMOUS ACCESS (If you don't have login yet)
-- ---------------------------------------------------------
-- WARNING: This allows ANYONE with your public key (the web app) to read/write data.
-- Enable these ONLY if you are in development and haven't built the Login page yet.
-- To enable, run the lines below in Query Editor.

/*
CREATE POLICY "Enable read/write for anon users" ON public.patients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for anon users" ON public.visits FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for anon users" ON public.medicines FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for anon users" ON public.prescriptions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for anon users" ON public.icd10_codes FOR ALL TO anon USING (true) WITH CHECK (true);
*/
