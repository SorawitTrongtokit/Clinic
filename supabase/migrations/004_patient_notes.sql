-- Add notes column to patients table for quick memos
ALTER TABLE patients ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Add comment for documentation
COMMENT ON COLUMN patients.notes IS 'Quick notes/memo for each patient';
