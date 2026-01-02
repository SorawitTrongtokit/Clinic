-- Add gender column to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'female';

-- Optional: Update existing records based on prefix if possible (simple heuristic)
UPDATE patients SET gender = 'male' WHERE prefix IN ('นาย', 'เด็กชาย');
UPDATE patients SET gender = 'female' WHERE prefix IN ('นาง', 'นางสาว', 'เด็กหญิง');
