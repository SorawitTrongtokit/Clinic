-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd10_codes ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES (to avoid conflicts/duplicates)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.visits;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.medicines;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.prescriptions;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.icd10_codes;

DROP POLICY IF EXISTS "Enable read/write for anon users" ON public.patients;
DROP POLICY IF EXISTS "Enable read/write for anon users" ON public.visits;
DROP POLICY IF EXISTS "Enable read/write for anon users" ON public.medicines;
DROP POLICY IF EXISTS "Enable read/write for anon users" ON public.prescriptions;
DROP POLICY IF EXISTS "Enable read/write for anon users" ON public.icd10_codes;

-- ENABLE ANONYMOUS ACCESS (Required for Client-side Access Key protection)
-- Since we are using a custom "Access Key" modal and NOT Supabase Auth,
-- the app connects as "anon". We must allow "anon" to read/write.

CREATE POLICY "Enable read/write for anon users" 
ON public.patients FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable read/write for anon users" 
ON public.visits FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable read/write for anon users" 
ON public.medicines FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable read/write for anon users" 
ON public.prescriptions FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable read/write for anon users" 
ON public.icd10_codes FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
