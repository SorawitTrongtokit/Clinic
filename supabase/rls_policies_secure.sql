-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd10_codes ENABLE ROW LEVEL SECURITY;

-- DROP ALL "ANON" POLICIES
DROP POLICY IF EXISTS "Enable read/write for anon users" ON public.patients;
DROP POLICY IF EXISTS "Enable read/write for anon users" ON public.visits;
DROP POLICY IF EXISTS "Enable read/write for anon users" ON public.medicines;
DROP POLICY IF EXISTS "Enable read/write for anon users" ON public.prescriptions;
DROP POLICY IF EXISTS "Enable read/write for anon users" ON public.icd10_codes;

-- RE-CREATE AUTHENTICATED POLICIES
-- These only allow users with a valid Supabase Session (staff@clinic.com) to access data

CREATE POLICY "Enable all access for authenticated users" 
ON public.patients FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" 
ON public.visits FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" 
ON public.medicines FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" 
ON public.prescriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" 
ON public.icd10_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
